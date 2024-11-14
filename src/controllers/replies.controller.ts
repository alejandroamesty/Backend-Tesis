import { Request, Response } from 'express';
import RepliesService from '../services/replies.service.ts';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';

class RepliesController {
	async postReply(req: Request, res: Response) {
		try {
			const { postId, content, parentReplyId } = req.body;
			const userId = req.user;

			verifyTypes([
				{
					value: content,
					type: 'string',
				},
				{
					value: postId,
					type: 'number',
				},
				{
					value: parentReplyId,
					type: 'number',
					optional: true,
				},
			]);

			const reply = await RepliesService.postReply(
				postId as number,
				userId as number,
				content as string,
				parentReplyId
			);
			res.json({ msg: 'Comentario agregado con exito', reply });
		} catch (error) {
			handleError(error, res);
		}
	}

	async deleteReply(req: Request, res: Response) {
		try {
			const { replyId } = req.body;
			const userId = req.user;

			verifyTypes([
				{
					value: replyId,
					type: 'number',
				},
			]);

			await RepliesService.deleteReply(replyId as number, userId as number);
			res.json({ msg: 'Comentario eliminado con exito' });
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new RepliesController();
