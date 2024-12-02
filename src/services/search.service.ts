import { sql } from 'kysely';
import db from '../app/db.ts';

class SearchService {
	async search(parameter: string, page: number = 1) {
		const limit = 5; // Max results for users and communities
		const offset = (page - 1) * limit;

		console.log('Searching for:', parameter);

		// Search Users
		const result = await db.transaction().execute(async (trx) => {
			const users = await trx
				.selectFrom('users')
				.select([
					'id',
					'username',
					'image',
					'fname',
					'lname',
					sql<number>`COUNT(user_followers.user_follower)`.as('followers_count'),
				])
				.leftJoin('user_followers', 'user_followers.user_id', 'users.id')
				.where('users.deleted_at', 'is', null)
				.where((eb) =>
					eb.or([
						// Properly parameterized concatenation
						sql<boolean>`concat(users.fname, ' ', users.lname) ILIKE ${
							'%' + parameter + '%'
						}`,
						eb('username', 'ilike', `%${parameter}%`), // Case-insensitive search
					])
				)
				.groupBy('users.id')
				.orderBy('followers_count', 'desc')
				.limit(limit)
				.offset(offset)
				.execute();
			// Search Communities
			const communities = await trx
				.selectFrom('communities')
				.select([
					'communities.id',
					'name',
					'image',
					'communities.description',
					sql<number>`COUNT(chat_members.user_id)`.as('members_count'),
				])
				.innerJoin('chats', 'chats.id', 'communities.chat_id')
				.leftJoin('chat_members', 'chat_members.chat_id', 'chats.id')
				.where('name', 'like', `%${parameter}%`)
				.groupBy('communities.id')
				.orderBy('members_count', 'desc')
				.limit(limit)
				.offset(offset)
				.execute();

			return { users, communities };
		});

		return result;
	}
}

export default new SearchService();
