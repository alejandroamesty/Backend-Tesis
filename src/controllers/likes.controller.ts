// @deno-types="@types/express"
import { Request, Response } from 'express';
import likesService from '../services/likes.service.ts';
import { handleError } from '../utils/errorHandler.ts';
import { UnauthorizedError } from '../utils/errors/httpErrors.ts';
import { verifyTypes } from '../utils/typeChecker.ts';

class LikesController {
	async likePost(req: Request, res: Response) {
		try {
			const userId = req.user;
			if (!userId) {
				throw new UnauthorizedError('No autorizado');
			}
			const postId = req.body.post_id;
			verifyTypes({ value: [postId, userId], type: 'uuid' });
			const like = await likesService.likePost(postId, userId);

			res.json({
				msg: 'Like agregado con exito',
				data: like,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async unlikePost(req: Request, res: Response) {
		try {
			const userId = req.user;
			if (!userId) {
				throw new UnauthorizedError('No autorizado');
			}
			const postId = req.body.post_id;
			verifyTypes({ value: [postId, userId], type: 'uuid' });
			const unlike = await likesService.unlikePost(postId, userId);

			res.json({
				msg: 'Like eliminado con exito',
				data: unlike,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async getPostLikes(req: Request, res: Response) {
		try {
			const postId = req.params.id;
			verifyTypes({ value: postId, type: 'uuid' });
			const likes = await likesService.getPostLikes(postId);

			res.json({
				msg: 'Data encontrada con exito',
				data: likes,
			});
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new LikesController();
