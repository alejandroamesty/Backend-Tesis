import db from '../app/db.ts';

class LikeService {
	async likePost(postId: number, userId: number) {
		const result = await db
			.insertInto('post_likes')
			.values({
				post_id: postId,
				user_id: userId,
			})
			.returning([
				'post_id',
				'user_id',
				db
					.selectFrom('post_likes')
					.where('post_likes.post_id', '=', postId)
					.select(db.fn.count('post_likes.user_id').as('current_likes'))
					.as('likes_nu'),
			])
			.executeTakeFirstOrThrow();

		return {
			post_id: result.post_id,
			user_id: result.user_id,
			likes_nu: Number(result.likes_nu) + 1,
		};
	}

	async unlikePost(postId: number, userId: number) {
		const result = await db
			.deleteFrom('post_likes')
			.where('post_likes.post_id', '=', postId)
			.where('post_likes.user_id', '=', userId)
			.returning([
				'post_id',
				'user_id',
				db
					.selectFrom('post_likes')
					.where('post_likes.post_id', '=', postId)
					.select(db.fn.count('post_likes.user_id').as('remaining_likes'))
					.as('likes_nu'),
			])
			.executeTakeFirstOrThrow();

		return {
			post_id: result.post_id,
			user_id: result.user_id,
			likes_nu: Number(result.likes_nu) - 1,
		};
	}

	async getPostLikes(postId: number) {
		const likesData = await db
			.selectFrom('post_likes')
			.leftJoin('users', 'users.id', 'post_likes.user_id')
			.where('post_likes.post_id', '=', postId)
			.select([
				'post_likes.post_id',
				db.fn.count('post_likes.user_id').as('likes_nu'),
				'users.id as user_id',
				'users.username',
				'users.image',
				'users.fname',
				'users.lname',
			])
			.groupBy([
				'post_likes.post_id',
				'users.id',
				'users.username',
				'users.image',
				'users.fname',
				'users.lname',
			])
			.execute();

		if (likesData.length === 0) return null;

		const result = {
			post_id: likesData[0].post_id,
			likes_nu: Number(likesData.length),
			likes: likesData.map((like) => ({
				id: like.user_id,
				username: like.username,
				image: like.image,
				fname: like.fname,
				lname: like.lname,
			})),
		};

		return result;
	}
}

export default new LikeService();
