import db from '../app/db.ts';

class UserService {
	async getAllUsers() {
		return await db
			.selectFrom('users')
			.select([
				'id',
				'fname',
				'lname',
				'username',
				'biography',
				'address',
				'image',
				'birth_date',
			])
			.execute();
	}

	async getUserById(id: number) {
		return await db
			.selectFrom('users')
			.where('id', '=', id)
			.select([
				'id',
				'fname',
				'lname',
				'username',
				'biography',
				'address',
				'image',
				'birth_date',
			])
			.executeTakeFirst();
	}

	async getUserByUsername(username: string) {
		return await db
			.selectFrom('users')
			.where('username', '=', username)
			.select([
				'id',
				'fname',
				'lname',
				'username',
				'biography',
				'address',
				'image',
				'birth_date',
			])
			.executeTakeFirst();
	}

	async getUserByEmail(email: string) {
		return await db
			.selectFrom('users')
			.where('email', '=', email)
			.select([
				'id',
				'fname',
				'lname',
				'username',
				'biography',
				'address',
				'image',
				'birth_date',
			])
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
