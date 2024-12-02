import db from '../app/db.ts';

class UserService {
	async getAllUsers() {
		return await db
			.selectFrom('users')
			.leftJoin('user_followers', 'users.id', 'user_followers.user_id')
			.leftJoin('posts', 'users.id', 'posts.user_id')
			.select([
				'users.id',
				'users.fname',
				'users.lname',
				'users.username',
				'users.biography',
				'users.address',
				'users.image',
				'users.birth_date',
				db.fn.count('posts.id').as('posts_nu'),
				db.fn.count('user_followers.user_follower').as('followers_nu'),
			])
			.groupBy('users.id') // Ensure grouping by user id to count followers
			.execute();
	} // for testing, delete later

	async getUserById(id: string) {
		const user = await db
			.selectFrom('users')
			.leftJoin('user_followers', 'users.id', 'user_followers.user_id')
			.where('users.id', '=', id)
			.select([
				'users.id',
				'users.fname',
				'users.lname',
				'users.username',
				'users.biography',
				'users.address',
				'users.image',
				'users.birth_date',
				db.fn.count('user_followers.user_follower').as('followers_nu'),
			])
			.groupBy('users.id') // Ensure grouping for aggregate functions
			.executeTakeFirst();

		if (user) {
			const posts = await this.getUserPosts(id, 1); // Get first 10 posts
			return { user, posts };
		}

		return { user: null, posts: [] };
	}

	async getUserByUsername(username: string) {
		const user = await db
			.selectFrom('users')
			.leftJoin('user_followers', 'users.id', 'user_followers.user_id')
			.where('users.username', '=', username)
			.select([
				'users.id',
				'users.fname',
				'users.lname',
				'users.username',
				'users.biography',
				'users.address',
				'users.image',
				'users.birth_date',
				db.fn.count('user_followers.user_follower').as('followers_nu'),
			])
			.groupBy('users.id') // Ensure grouping for aggregate functions
			.executeTakeFirst();

		if (user) {
			const posts = await this.getUserPosts(user.id, 1); // Get first 10 posts
			return { user, posts };
		}

		return { user: null, posts: [] };
	}

	async getUserByEmail(email: string) {
		const user = await db
			.selectFrom('users')
			.leftJoin('user_followers', 'users.id', 'user_followers.user_id')
			.where('users.email', '=', email)
			.select([
				'users.id',
				'users.fname',
				'users.lname',
				'users.username',
				'users.biography',
				'users.address',
				'users.image',
				'users.birth_date',
				db.fn.count('user_followers.user_follower').as('followers_nu'),
			])
			.groupBy('users.id') // Ensure grouping for aggregate functions
			.executeTakeFirst();

		if (user) {
			const posts = await this.getUserPosts(user.id, 1); // Get first 10 posts
			return { user, posts };
		}

		return { user: null, posts: [] };
	}

	async updateUser(
		id: string,
		data: Partial<{
			username: string;
			image?: string;
			fname: string;
			lname: string;
			biography?: string;
			email: string;
			password: string;
			address?: string;
			birth_date?: Date;
		}>,
	) {
		return await db.updateTable('users').set(data).where('id', '=', id).where(
			'deleted_at',
			'is',
			null,
		).execute();
	}

	async deleteUser(id: string) {
		console.log(id);
		return await db.updateTable('users').set({ deleted_at: new Date() })
			.where('id', '=', id)
			.where('deleted_at', 'is', null)
			.returning([
				'id',
				'fname',
				'lname',
				'username',
				'email',
				'biography',
				'address',
				'birth_date',
				'image',
			])
			.executeTakeFirstOrThrow();
	}

	async getUserPosts(userId: string, page = 1) {
		const limit = 10;
		const offset = (page - 1) * limit;

		const posts = await db
			.selectFrom('posts')
			.leftJoin('users', 'posts.user_id', 'users.id')
			.leftJoin('post_images', 'posts.id', 'post_images.post_id')
			.leftJoin('post_videos', 'posts.id', 'post_videos.post_id')
			.where('posts.user_id', '=', userId)
			.select([
				'posts.id as postId',
				'posts.caption',
				'posts.post_date',
				'posts.likes',
				db.fn.jsonAgg('post_images')
					.filterWhere('post_images.image', 'is not', null)
					.as('images'),
				db.fn.jsonAgg('post_videos')
					.filterWhere('post_videos.video', 'is not', null)
					.as('videos'),
			])
			.groupBy('posts.id')
			.orderBy('posts.post_date', 'desc') // Sort by most recent
			.limit(limit)
			.offset(offset)
			.execute();

		return posts.map((post) => ({
			id: post.postId,
			caption: post.caption,
			post_date: post.post_date,
			likes: post.likes,
			images: post.images || [], // Placeholder for count
			videos: post.videos || [], // Placeholder for count
		}));
	}
}

export default new UserService();
