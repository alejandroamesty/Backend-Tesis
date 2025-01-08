import type { Transaction } from 'kysely';
import db from '../app/db.ts';
import { sql } from 'kysely';
import type { PostsTable } from '../models/posts/posts.model.ts';
import type { Database } from '../models/database.model.ts';
import { NotFoundError, UnauthorizedError } from '../utils/errors/httpErrors.ts';
import categoriesService from './categories.service.ts';

interface ReplyUser {
	username: string;
	fname: string;
	lname: string;
	image: string | null;
}

interface NestedReply {
	id: string;
	user: ReplyUser;
	content: string;
	created_at: Date;
}

interface ReplyType {
	id: string;
	user: ReplyUser;
	content: string;
	created_at: Date;
	replies: NestedReply[];
}

class PostService {
	private mergePosts(
		followedPosts: Array<{
			id: string;
			caption: string;
			content: string;
			post_date: Date;
			likes: number;
			username: string;
			userId: string;
			replies_nu: number;
			images: string[];
			videos: string[];
		}>,
		popularPosts: Array<{
			id: string;
			caption: string;
			content: string;
			post_date: Date;
			likes: number;
			username: string;
			userId: string;
			replies_nu: number;
			engagement_score: number;
			images: string[];
			videos: string[];
		}>,
		limit: number,
	) {
		const merged = [];
		let i = 0, j = 0;

		while (merged.length < limit && (i < followedPosts.length || j < popularPosts.length)) {
			// Followed users' posts (60% of feed)
			if (merged.length % 5 < 3 && i < followedPosts.length) {
				merged.push(followedPosts[i++]);
			} // Popular posts (40% of feed)
			else if (j < popularPosts.length) {
				merged.push(popularPosts[j++]);
			}
		}

		return merged;
	}

	async getPosts(userId: string, page: number = 1, limit: number = 10) {
		const offset = (page - 1) * limit;
		const bufferSize = Math.ceil(limit * 0.4);

		return await db.transaction().execute(async (trx) => {
			// Fetch posts from followed users
			const followedPosts = await trx
				.selectFrom('posts')
				.innerJoin('users', 'users.id', 'posts.user_id')
				.innerJoin('user_followers', 'user_followers.user_id', 'posts.user_id')
				.leftJoin('post_replies', 'post_replies.post_id', 'posts.id')
				.leftJoin('post_images', 'posts.id', 'post_images.post_id')
				.leftJoin('post_videos', 'posts.id', 'post_videos.post_id')
				.leftJoin('post_likes', (join) =>
					join
						.on('post_likes.post_id', '=', sql`CAST(posts.id AS UUID)`)
						.on('post_likes.user_id', '=', sql`${userId}`))
				.select([
					'posts.id',
					'posts.caption',
					'posts.content',
					'posts.post_date',
					'posts.likes',
					'users.id as userId',
					'users.username',
					'users.fname',
					'users.lname',
					'users.image',
					sql<number>`COUNT(post_replies.id)`.as('replies_nu'),
					sql<string[]>`ARRAY_AGG(DISTINCT post_images.image)`.as('images'),
					sql<string[]>`ARRAY_AGG(DISTINCT post_videos.video)`.as('videos'),
					sql<boolean>`(post_likes.user_id IS NOT NULL)`.as('user_liked'),
				])
				.where('user_followers.user_follower', '=', userId)
				.where('posts.user_id', '!=', userId)
				.where(
					'posts.category_id',
					'=',
					categoriesService.getCategoryByName('Post')?.id || '',
				)
				.orderBy('posts.post_date', 'desc')
				.groupBy(['posts.id', 'users.id', 'post_likes.user_id'])
				.limit(Math.ceil(limit * 0.6) + bufferSize)
				.execute();

			// Fetch popular posts (excluding followed users)
			const popularPosts = await trx
				.selectFrom('posts')
				.innerJoin('users', 'users.id', 'posts.user_id')
				.leftJoin('post_replies', 'post_replies.post_id', 'posts.id')
				.leftJoin('post_images', 'posts.id', 'post_images.post_id')
				.leftJoin('post_videos', 'posts.id', 'post_videos.post_id')
				.leftJoin('post_likes', (join) =>
					join
						.on('post_likes.post_id', '=', sql`CAST(posts.id AS UUID)`)
						.on('post_likes.user_id', '=', sql`${userId}`))
				.select([
					'posts.id',
					'posts.caption',
					'posts.content',
					'posts.post_date',
					'posts.likes',
					'users.id as userId',
					'users.username',
					'users.fname',
					'users.lname',
					'users.image',
					sql<number>`COUNT(post_replies.id)`.as('replies_nu'),
					sql<number>`posts.likes + COUNT(post_replies.id)`.as('engagement_score'),
					sql<string[]>`ARRAY_AGG(DISTINCT post_images.image)`.as('images'),
					sql<string[]>`ARRAY_AGG(DISTINCT post_videos.video)`.as('videos'),
					sql<boolean>`(post_likes.user_id IS NOT NULL)`.as('user_liked'),
				])
				.where('posts.user_id', '!=', userId)
				.where((eb) =>
					eb.not(
						eb.exists(
							trx
								.selectFrom('user_followers')
								.select('user_followers.user_id')
								.where(sql`user_followers.user_id`, '=', sql`posts.user_id`)
								.where('user_followers.user_follower', '=', userId),
						),
					)
				)
				.where(
					'posts.category_id',
					'=',
					categoriesService.getCategoryByName('Post')?.id || '',
				)
				.groupBy(['posts.id', 'users.id', 'post_likes.user_id'])
				.orderBy('engagement_score', 'desc')
				.orderBy('posts.post_date', 'desc')
				.limit(Math.ceil(limit * 0.4) + bufferSize)
				.execute();

			// Merge the results
			const mergedPosts = this.mergePosts(followedPosts, popularPosts, limit);

			// Apply pagination to the merged results
			const paginatedPosts = mergedPosts.slice(offset, offset + limit);

			return paginatedPosts;
		});
	}

	async getFollowedPosts(userId: string, page: number = 1, limit: number = 10) {
		const offset = (page - 1) * limit;

		const followedPosts = await db
			.selectFrom('posts')
			.innerJoin('users', 'users.id', 'posts.user_id')
			.innerJoin('user_followers', 'user_followers.user_id', 'posts.user_id')
			.leftJoin(
				db
					.selectFrom('post_replies')
					.select(['post_id', sql<number>`COUNT(id)`.as('reply_count')])
					.groupBy('post_id')
					.as('reply_counts'),
				'reply_counts.post_id',
				'posts.id',
			)
			.leftJoin(
				db
					.selectFrom('post_images')
					.select(['post_id', sql<string[]>`ARRAY_AGG(DISTINCT image)`.as('images')])
					.groupBy('post_id')
					.as('image_agg'),
				'image_agg.post_id',
				'posts.id',
			)
			.leftJoin(
				db
					.selectFrom('post_videos')
					.select(['post_id', sql<string[]>`ARRAY_AGG(DISTINCT video)`.as('videos')])
					.groupBy('post_id')
					.as('video_agg'),
				'video_agg.post_id',
				'posts.id',
			)
			.leftJoin(
				db
					.selectFrom('post_likes')
					.where('user_id', '=', userId)
					.select(['post_id', sql<boolean>`TRUE`.as('user_liked')])
					.as('user_likes'),
				'user_likes.post_id',
				'posts.id',
			)
			.select([
				'posts.id',
				'posts.caption',
				'posts.content',
				'posts.post_date',
				'posts.likes',
				'users.id as userId',
				'users.username',
				'users.fname',
				'users.lname',
				'users.image',
				sql<number>`COALESCE(reply_counts.reply_count, 0)`.as('replies_nu'),
				sql<string[]>`COALESCE(image_agg.images, ARRAY[]::VARCHAR[])`.as('images'),
				sql<string[]>`COALESCE(video_agg.videos, ARRAY[]::VARCHAR[])`.as('videos'),
				sql<boolean>`COALESCE(user_likes.user_liked, FALSE)`.as('user_liked'),
			])
			.where('user_followers.user_follower', '=', userId)
			.where('posts.user_id', '!=', userId)
			.where(
				'posts.category_id',
				'=',
				categoriesService.getCategoryByName('Post')?.id || '',
			)
			.groupBy([
				'posts.id',
				'users.id',
				'user_likes.user_liked',
				'reply_counts.reply_count',
				'image_agg.images',
				'video_agg.videos',
			])
			.orderBy('posts.post_date', 'desc')
			.limit(limit)
			.execute();

		const paginatedPosts = followedPosts.slice(offset, offset + limit);

		return paginatedPosts;
	}

	async getPopularPosts(userId: string, page: number = 1, limit: number = 10) {
		const offset = (page - 1) * limit;

		const popularPosts = await db.transaction().execute(async (trx) => {
			const popularPosts = await trx
				.selectFrom('posts')
				.innerJoin('users', 'users.id', 'posts.user_id')
				.leftJoin(
					trx
						.selectFrom('post_replies')
						.select(['post_id', sql<number>`COUNT(id)`.as('reply_count')])
						.groupBy('post_id')
						.as('reply_counts'),
					'reply_counts.post_id',
					'posts.id',
				)
				.leftJoin(
					trx
						.selectFrom('post_images')
						.select(['post_id', sql<string[]>`ARRAY_AGG(DISTINCT image)`.as('images')])
						.groupBy('post_id')
						.as('image_agg'),
					'image_agg.post_id',
					'posts.id',
				)
				.leftJoin(
					trx
						.selectFrom('post_videos')
						.select(['post_id', sql<string[]>`ARRAY_AGG(DISTINCT video)`.as('videos')])
						.groupBy('post_id')
						.as('video_agg'),
					'video_agg.post_id',
					'posts.id',
				)
				.leftJoin(
					trx
						.selectFrom('post_likes')
						.where('user_id', '=', userId)
						.select(['post_id', sql<boolean>`TRUE`.as('user_liked')])
						.as('user_likes'),
					'user_likes.post_id',
					'posts.id',
				)
				.select([
					'posts.id',
					'posts.caption',
					'posts.content',
					'posts.post_date',
					'posts.likes',
					'users.id as userId',
					'users.username',
					'users.fname',
					'users.lname',
					'users.image',
					sql<number>`COALESCE(reply_counts.reply_count, 0)`.as('replies_nu'),
					sql<number>`posts.likes + COALESCE(reply_counts.reply_count, 0)`.as(
						'engagement_score',
					),
					sql<string[]>`COALESCE(image_agg.images, ARRAY[]::VARCHAR[])`.as('images'),
					sql<string[]>`COALESCE(video_agg.videos, ARRAY[]::VARCHAR[])`.as('videos'),
					sql<boolean>`COALESCE(user_likes.user_liked, FALSE)`.as('user_liked'),
				])
				.where('posts.user_id', '!=', userId)
				.where((eb) =>
					eb.not(
						eb.exists(
							trx
								.selectFrom('user_followers')
								.select('user_followers.user_id')
								.where(sql`user_followers.user_id`, '=', sql`posts.user_id`)
								.where('user_followers.user_follower', '=', userId),
						),
					)
				)
				.where(
					'posts.category_id',
					'=',
					categoriesService.getCategoryByName('Post')?.id || '',
				)
				.groupBy([
					'posts.id',
					'users.id',
					'image_agg.images',
					'video_agg.videos',
					'user_likes.user_liked',
					'reply_counts.reply_count',
				])
				.orderBy('engagement_score', 'desc')
				.orderBy('posts.post_date', 'desc')
				.limit(limit)
				.execute();

			const paginatedPosts = popularPosts.slice(offset, offset + limit);

			return paginatedPosts;
		});

		return popularPosts;
	}

	async getPost(id: string, user_id: string) {
		const rows = await db
			.selectFrom('posts')
			.leftJoin('users', 'posts.user_id', 'users.id')
			.leftJoin('coordinates', 'posts.coordinates_id', 'coordinates.id')
			.leftJoin('post_categories', 'posts.category_id', 'post_categories.id')
			.leftJoin('post_images', 'posts.id', 'post_images.post_id')
			.leftJoin('post_videos', 'posts.id', 'post_videos.post_id')
			.leftJoin('post_replies as replies', 'posts.id', 'replies.post_id')
			.leftJoin('users as reply_users', 'replies.user_id', 'reply_users.id')
			.leftJoin(
				'post_replies as nested_replies',
				'replies.id',
				'nested_replies.parent_reply_id',
			)
			.leftJoin('users as nested_users', 'nested_replies.user_id', 'nested_users.id')
			.leftJoin('post_likes', (join) =>
				join
					.on('post_likes.post_id', '=', sql`CAST(posts.id AS UUID)`)
					.on('post_likes.user_id', '=', sql`${user_id}`))
			.where('posts.id', '=', id)
			.select([
				// Main post fields
				'posts.id as postId',
				'posts.caption',
				'posts.content',
				'posts.post_date',
				'posts.likes',

				// User details for post author
				'users.id as userId',
				'users.username as userUsername',
				'users.fname as userFname',
				'users.lname as userLname',
				'users.image as userImage',

				// Coordinates
				'coordinates.x',
				'coordinates.y',

				// Category
				'post_categories.name as categoryName',

				// Media
				'post_images.image as image',
				'post_videos.video as video',

				// Top-level replies
				'replies.id as replyId',
				'replies.content as replyContent',
				'replies.created_at as replyCreatedAt',
				'reply_users.username as replyUserUsername',
				'reply_users.fname as replyUserFname',
				'reply_users.lname as replyUserLname',
				'reply_users.image as replyUserImage',

				// Nested replies
				'nested_replies.id as nestedReplyId',
				'nested_replies.content as nestedReplyContent',
				'nested_replies.created_at as nestedReplyCreatedAt',
				'nested_users.username as nestedReplyUserUsername',
				'nested_users.fname as nestedReplyUserFname',
				'nested_users.lname as nestedReplyUserLname',
				'nested_users.image as nestedReplyUserImage',

				sql<boolean>`(post_likes.user_id IS NOT NULL)`.as('user_liked'),
			])
			.groupBy([
				'posts.id',
				'users.id',
				'post_likes.user_id',
				'replies.id',
				'nested_replies.id',
				'coordinates.x',
				'coordinates.y',
				'post_categories.name',
				'post_images.image',
				'post_videos.video',
				'reply_users.username',
				'reply_users.fname',
				'reply_users.lname',
				'reply_users.image',
				'nested_users.username',
				'nested_users.fname',
				'nested_users.lname',
				'nested_users.image',
			])
			.execute();

		if (rows.length === 0) return null;

		// Extract main post details from the first row
		const {
			postId,
			caption,
			content,
			post_date,
			likes,
			user_liked,
			userId,
			userUsername,
			userFname,
			userLname,
			userImage,
			x,
			y,
			categoryName,
		} = rows[0];

		// Aggregate images and videos
		const images = rows
			.map((row) => row.image)
			.filter((image): image is string => image !== null)
			.filter((image, index, self) => self.indexOf(image) === index);
		const videos = rows
			.map((row) => row.video)
			.filter((video): video is string => video !== null)
			.filter((video, index, self) => self.indexOf(video) === index);

		const repliesMap = new Map<string, ReplyType>();
		const nestedReplyIds = new Set<string>();

		// First, collect all IDs marked as nested replies to avoid duplicating them as top-level replies
		rows.forEach((row) => {
			if (row.nestedReplyId) {
				nestedReplyIds.add(row.nestedReplyId);
			}
		});

		// First pass: Add only true non-nested (top-level) replies
		rows.forEach((row) => {
			if (row.replyId && !nestedReplyIds.has(row.replyId)) {
				// Only add if it's not also a nested reply
				const reply: ReplyType = {
					id: row.replyId,
					user: {
						username: row.replyUserUsername || '',
						fname: row.replyUserFname || '',
						lname: row.replyUserLname || '',
						image: row.replyUserImage || null,
					},
					content: row.replyContent || '',
					created_at: row.replyCreatedAt || new Date(),
					replies: [], // Empty array for nested replies
				};

				repliesMap.set(row.replyId, reply);
			}
		});

		// Second pass: Add nested replies to their respective parent replies
		rows.forEach((row) => {
			if (row.nestedReplyId && row.replyId) {
				// Only add nested replies
				const parentReply = repliesMap.get(row.replyId);

				// Ensure we only add nested replies to existing parent replies and avoid duplicates
				if (
					parentReply &&
					!parentReply.replies.some((r) => r.id === row.nestedReplyId)
				) {
					const nestedReply: NestedReply = {
						id: row.nestedReplyId,
						user: {
							username: row.nestedReplyUserUsername || '',
							fname: row.nestedReplyUserFname || '',
							lname: row.nestedReplyUserLname || '',
							image: row.nestedReplyUserImage || null,
						},
						content: row.nestedReplyContent || '',
						created_at: row.nestedReplyCreatedAt || new Date(),
					};

					parentReply.replies.push(nestedReply);
				}
			}
		});

		// Convert map to array for ordered replies and calculate total replies
		const replies = Array.from(repliesMap.values());
		const replies_nu = replies.length;

		// Return the final structure
		return {
			post: {
				id: postId,
				caption,
				content,
				coordinates: { x, y },
				postCategory: categoryName,
				images,
				videos,
				post_date,
				user_liked,
				likes,
				replies_nu,
				replies,
			},
			user: {
				id: userId,
				username: userUsername,
				fname: userFname,
				lname: userLname,
				image: userImage,
			},
		};
	}

	async createPost(data: {
		post_data: Omit<
			PostsTable,
			'id' | 'likes' | 'post_date' | 'coordinates_id' | 'category_id'
		>;
		coordinates?: { x: number; y: number }; // Make coordinates optional
		images?: string[]; // Optional
		videos?: string[]; // Optional
	}) {
		const category_id = categoriesService.getCategoryByName('Post')?.id;
		return await db.transaction().execute(async (trx: Transaction<Database>) => {
			let coordinatesId: string | null = null;

			// If coordinates are provided, handle them
			if (data.coordinates) {
				// Check if the coordinate already exists
				const existingCoordinate = await trx
					.selectFrom('coordinates')
					.select('id')
					.where('x', '=', data.coordinates.x)
					.where('y', '=', data.coordinates.y)
					.executeTakeFirst();

				// Insert a new coordinate if it doesn't exist
				if (!existingCoordinate) {
					const insertedCoordinate = await trx
						.insertInto('coordinates')
						.values(data.coordinates)
						.returning('id')
						.executeTakeFirstOrThrow();
					coordinatesId = insertedCoordinate.id;
				} else {
					coordinatesId = existingCoordinate.id;
				}
			}

			// Insert the post with coordinates_id set to null or the actual ID
			const insertedPost = await trx
				.insertInto('posts')
				.values({
					...data.post_data,
					category_id: category_id || '',
					coordinates_id: coordinatesId, // Can be null if no coordinates
				})
				.returning('id')
				.executeTakeFirstOrThrow();

			const postId = insertedPost.id;

			const user = await trx
				.selectFrom('users')
				.select(['id', 'username', 'fname', 'lname', 'image'])
				.where('id', '=', data.post_data.user_id)
				.executeTakeFirstOrThrow();

			// Prepare and insert images and videos
			const images = data.images?.map((image) => ({ post_id: postId, image })) ?? [];
			const videos = data.videos?.map((video) => ({ post_id: postId, video })) ?? [];

			if (images.length > 0) {
				await trx.insertInto('post_images').values(images).execute();
			}
			if (videos.length > 0) {
				await trx.insertInto('post_videos').values(videos).execute();
			}

			return {
				user: {
					...user,
				},
				post: {
					id: postId,
				},
			};
		});
	}

	async deletePost(id: string, user_id: string) {
		return await db.transaction().execute(async (trx: Transaction<Database>) => {
			// Check if the post exists and the user is the author
			const post = await trx
				.selectFrom('posts')
				.selectAll()
				.where('id', '=', id)
				.executeTakeFirst();

			if (!post) {
				throw new NotFoundError('Post no encontrado');
			}
			if (post.user_id !== user_id) {
				throw new UnauthorizedError('Usuario no autorizado');
			}

			// Delete the post
			await trx.deleteFrom('posts').where('id', '=', id).execute();

			return true;
		});
	}
}

export default new PostService();
