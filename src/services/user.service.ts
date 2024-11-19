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
	}

	async getUserById(id: number) {
		return await db
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
	}

	async getUserByUsername(username: string) {
		return await db
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
	}

	async getUserByEmail(email: string) {
		return await db
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
	}

	async updateUser(
		id: number,
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
		return await db.updateTable('users').set(data).where('id', '=', id).execute();
	}

	async deleteUser(id: number) {
		return await db.deleteFrom('users').where('id', '=', id).execute();
	}
}

export default new UserService();
