import type { Transaction } from 'kysely';
import db from '../app/db.ts';
import type { PostsTable } from '../models/posts/posts.model.ts';
import type { Database } from '../models/database.model.ts';
import { NotFoundError, UnauthorizedError } from '../utils/errors/httpErrors.ts';

interface ReplyUser {
	username: string;
	image: string | null;
}

interface NestedReply {
	id: number;
	user: ReplyUser;
	content: string;
	created_at: Date;
}

interface ReplyType {
	id: number;
	user: ReplyUser;
	content: string;
	created_at: Date;
	replies: NestedReply[];
}

class PostService {
	async getPost(id: number) {
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
				'reply_users.image as replyUserImage',

				// Nested replies
				'nested_replies.id as nestedReplyId',
				'nested_replies.content as nestedReplyContent',
				'nested_replies.created_at as nestedReplyCreatedAt',
				'nested_users.username as nestedReplyUserUsername',
				'nested_users.image as nestedReplyUserImage',
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
			userId,
			userUsername,
			userFname,
			userLname,
			x,
			y,
			categoryName,
		} = rows[0];

		// Aggregate images and videos
		const images = rows
			.map((row) => row.image)
			.filter((image): image is string => image !== null);
		const videos = rows
			.map((row) => row.video)
			.filter((video): video is string => video !== null);

		const repliesMap = new Map<number, ReplyType>();
		const nestedReplyIds = new Set<number>();

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
				likes,
				replies_nu,
				replies,
			},
			user: {
				id: userId,
				username: userUsername,
				fname: userFname,
				lname: userLname,
			},
		};
	}

	async createPost(data: {
		post_data: Omit<PostsTable, 'id' | 'likes' | 'post_date' | 'coordinates_id'>;
		coordinates?: { x: number; y: number }; // Make coordinates optional
		images?: string[]; // Optional
		videos?: string[]; // Optional
	}) {
		return await db.transaction().execute(async (trx: Transaction<Database>) => {
			let coordinatesId: number | null = null;

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
					coordinates_id: coordinatesId, // Can be null if no coordinates
				})
				.returning('id')
				.executeTakeFirstOrThrow();

			const postId = insertedPost.id;

			// Prepare and insert images and videos
			const images = data.images?.map((image) => ({ post_id: postId, image })) ?? [];
			const videos = data.videos?.map((video) => ({ post_id: postId, video })) ?? [];

			if (images.length > 0) {
				await trx.insertInto('post_images').values(images).execute();
			}
			if (videos.length > 0) {
				await trx.insertInto('post_videos').values(videos).execute();
			}

			return postId;
		});
	}

	async deletePost(id: number, user_id: number) {
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
