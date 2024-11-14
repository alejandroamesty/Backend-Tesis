import db from '../app/db.ts';
import { NotFoundError } from '../utils/errors/httpErrors.ts';

class RepliesService {
	async postReply(
		postId: number,
		userId: number,
		content: string,
		parentReplyId?: number,
	) {
		// If parentReplyId is provided, check if it belongs to the same post
		if (parentReplyId) {
			const parentReply = await db
				.selectFrom('post_replies')
				.where('id', '=', parentReplyId)
				.where('post_id', '=', postId)
				.where('parent_reply_id', 'is', null)
				.select(['id'])
				.executeTakeFirst();

			// If no parent reply is found for the given postId, throw an error
			if (!parentReply) {
				throw new NotFoundError('Parent reply not found');
			}
		}

		// Insert the new reply
		return await db
			.insertInto('post_replies')
			.values({
				post_id: postId,
				user_id: userId,
				content,
				parent_reply_id: parentReplyId ?? null,
			})
			.returning(['id', 'post_id', 'parent_reply_id', 'content', 'created_at'])
			.execute();
	}

	async deleteReply(replyId: number, userId: number) {
		return await db
			.deleteFrom('post_replies')
			.where('id', '=', replyId)
			.where('user_id', '=', userId)
			.executeTakeFirstOrThrow();
	}
}

export default new RepliesService();
