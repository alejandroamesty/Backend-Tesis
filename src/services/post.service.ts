import type { Transaction } from 'kysely';
import db from '../app/db.ts';
import type { PostsTable } from '../models/posts/posts.model.ts';
import type { Database } from '../models/database.model.ts';

class PostService {
	async getPost(id: number) {
		const rows = await db
			.selectFrom('posts')
			.leftJoin('users', 'posts.user_id', 'users.id')
			.leftJoin('coordinates', 'posts.coordinates_id', 'coordinates.id')
			.leftJoin('post_categories', 'posts.category_id', 'post_categories.id')
			.leftJoin('post_images', 'posts.id', 'post_images.post_id')
			.leftJoin('post_videos', 'posts.id', 'post_videos.post_id')
			.where('posts.id', '=', id)
			.select([
				// Select fields from 'posts'
				'posts.id as postId',
				'posts.caption',
				'posts.content',
				'posts.post_date',
				'posts.likes',

				// Select fields from 'users'
				'users.id as userId',
				'users.username',
				'users.fname',
				'users.lname',

				// Select fields from 'coordinates'
				'coordinates.x',
				'coordinates.y',

				// Select fields from 'post_categories'
				'post_categories.name as categoryName',

				// Select fields from 'post_images' and 'post_videos'
				'post_images.image as image',
				'post_videos.video as video',
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
			username,
			fname,
			lname,
			x,
			y,
			categoryName,
		} = rows[0];

		// Aggregate images and videos from all rows
		const images = rows
			.map((row) => row.image)
			.filter((image): image is string => image !== null);
		const videos = rows
			.map((row) => row.video)
			.filter((video): video is string => video !== null);

		return {
			post: {
				id: postId,
				caption,
				content,
				coordinates: {
					x,
					y,
				},
				postCategory: categoryName,
				images,
				videos,
				post_date,
				likes,
			},
			user: {
				id: userId,
				username,
				fname,
				lname,
			},
		};
	}

	async createPost(data: {
		post_data: Omit<PostsTable, 'id' | 'likes' | 'post_date'>;
		images?: string[];
		videos?: string[];
	}) {
		return await db.transaction().execute(async (trx: Transaction<Database>) => {
			const inertedPost = await trx
				.insertInto('posts')
				.values(data.post_data)
				.returning('id')
				.executeTakeFirstOrThrow();

			const postId = inertedPost.id;

			const images = data.images?.map((image) => ({ post_id: postId, image })) ?? [];
			const videos = data.videos?.map((video) => ({ post_id: postId, video })) ?? [];

			await trx.insertInto('post_images').values(images).execute();
			await trx.insertInto('post_videos').values(videos).execute();

			return postId;
		});
	}
}

export default new PostService();
