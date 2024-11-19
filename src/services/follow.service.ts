import db from '../app/db.ts';

class FollowService {
	async getFollowers(userId: number) {
		const rows = await db
			.selectFrom('user_followers')
			.leftJoin('users', 'user_followers.user_follower', 'users.id')
			.where('user_followers.user_id', '=', userId)
			.select([
				'users.id',
				'users.fname',
				'users.lname',
				'users.username',
				'users.biography',
				'users.address',
				'users.image',
				'users.birth_date',
			])
			.execute();

		return rows;
	}

	async followUser(userId: number, followerId: number) {
		const result = await db
			.insertInto('user_followers')
			.values({
				user_id: userId,
				user_follower: followerId,
			})
			.returning(['user_id', 'user_follower'])
			.executeTakeFirstOrThrow();

		return result;
	}

	async unfollowUser(userId: number, followerId: number) {
		const result = await db
			.deleteFrom('user_followers')
			.where('user_id', '=', userId)
			.where('user_follower', '=', followerId)
			.returning(['user_id', 'user_follower'])
			.executeTakeFirstOrThrow();

		return result;
	}
}

export default new FollowService();
