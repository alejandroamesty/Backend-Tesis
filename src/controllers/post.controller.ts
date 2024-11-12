import postService from '../services/post.service.ts';
import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { NotFoundError } from '../utils/errors/httpErrors.ts';

class PostController {
	async getPost(req: Request, res: Response) {
		try {
			const id = parseInt(req.params.id);
			verifyTypes([{ value: id, type: 'number' }]);
			const post = await postService.getPost(id);
			if (!post) throw new NotFoundError('Post no encontrado');

			const response = {
				msg: 'Data encontrada con exito',
				data: post,
			};

			res.json(response);
		} catch (error) {
			const err = handleError(error);
			res.status(err.code).json(err.message);
		}
	}
}

export default new PostController();
