import db from '../app/db.ts';
import { PostsTable } from '../models/posts/posts.model.ts';
import { Database } from '../models/database.model.ts';
import categoriesService from './categories.service.ts';
import { sql, Transaction } from 'kysely';
import { NotFoundError, UnauthorizedError } from '../utils/errors/httpErrors.ts';

class ReportService {
	async getReport(id: string) {
		const report = await db
			.selectFrom('posts')
			.innerJoin('coordinates', 'posts.coordinates_id', 'coordinates.id')
			.innerJoin('post_categories as categories', 'posts.category_id', 'categories.id')
			.leftJoin('post_images', 'posts.id', 'post_images.post_id')
			.leftJoin('post_videos', 'posts.id', 'post_videos.post_id')
			.select([
				'posts.id',
				'posts.caption',
				'posts.content',
				'posts.post_date',
				'coordinates.x',
				'coordinates.y',
				sql<string[]>`ARRAY_AGG(DISTINCT post_images.image)`.as('images'),
				sql<string[]>`ARRAY_AGG(DISTINCT post_videos.video)`.as('videos'),
			])
			.where('posts.id', '=', id)
			.groupBy(['posts.id', 'coordinates.id'])
			.executeTakeFirst();

		return report;
	}

	async getReports(location: { x: number; y: number }, radius: number, months: number) {
		const dateLimit = new Date();
		dateLimit.setMonth(dateLimit.getMonth() - months);

		const results = await db
			.selectFrom('posts')
			.innerJoin('coordinates', 'posts.coordinates_id', 'coordinates.id')
			.innerJoin('post_categories as categories', 'posts.category_id', 'categories.id')
			.leftJoin('post_images', 'posts.id', 'post_images.post_id')
			.leftJoin('post_videos', 'posts.id', 'post_videos.post_id')
			.select([
				'posts.id',
				'posts.caption',
				'posts.content',
				'posts.post_date',
				'coordinates.x',
				'coordinates.y',
				sql<string[]>`ARRAY_AGG(DISTINCT post_images.image)`.as('images'),
				sql<string[]>`ARRAY_AGG(DISTINCT post_videos.video)`.as('videos'),
				sql`(
					6371 * 2 * ASIN(SQRT(
						POWER(SIN((radians(${location.y}) - radians(coordinates.y)) / 2), 2) +
						COS(radians(${location.y})) * COS(radians(coordinates.y)) *
						POWER(SIN((radians(${location.x}) - radians(coordinates.x)) / 2), 2)
					))
				)`.as('distance'),
			])
			.where('categories.name', '=', 'Report')
			.where('posts.post_date', '>=', dateLimit)
			.having(
				sql`(
					6371 * 2 * ASIN(SQRT(
						POWER(SIN((radians(${location.y}) - radians(coordinates.y)) / 2), 2) +
						COS(radians(${location.y})) * COS(radians(coordinates.y)) *
						POWER(SIN((radians(${location.x}) - radians(coordinates.x)) / 2), 2)
					))
				)`,
				'<=',
				radius,
			)
			.orderBy('distance', 'asc')
			.groupBy(['posts.id', 'coordinates.id'])
			.execute();

		return results;
	}

	async createReport(data: {
		post_data: Omit<
			PostsTable,
			'id' | 'likes' | 'post_date' | 'coordinates_id' | 'category_id'
		>;
		coordinates: { x: number; y: number }; // Make coordinates optional
		images?: string[]; // Optional
		videos?: string[]; // Optional
	}) {
		const category_id = categoriesService.getCategoryByName('Report')?.id;
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

	// todo: implement authorization
	async deleteReport(id: string, user_id: string) {
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

export default new ReportService();
