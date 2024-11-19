// @deno-types="@types/express"
import { Request, Response } from 'express';
import postService from '../services/post.service.ts';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { NotFoundError } from '../utils/errors/httpErrors.ts';
import { UnauthorizedError } from '../utils/errors/httpErrors.ts';

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
			handleError(error, res);
		}
	}

	async createPost(req: Request, res: Response) {
		try {
			const { caption, category_id, coordinates, content, videos, images } = req.body;
			const x = coordinates?.x || undefined;
			const y = coordinates?.y || undefined;
			const user_id = req.user;

			if (!user_id) {
				throw new UnauthorizedError('Usuario no encontrado');
			}

			verifyTypes([
				{ value: [caption, content], type: 'string' },
				{ value: category_id, type: 'number' },
				{ value: [x, y], type: 'number', optional: true },
				{ value: videos, type: 'video', optional: true },
				{ value: images, type: 'image', optional: true },
			]);

			const post = await postService.createPost({
				post_data: {
					caption: caption as string,
					user_id: Number(user_id),
					category_id: category_id as number,
					content: content as string,
				},
				coordinates: (coordinates as { x: number; y: number }) ?? undefined,
				videos: videos as string[],
				images: images as string[],
			});

			return res.json({
				msg: 'Post creado con exito',
				data: post,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async deletePost(req: Request, res: Response) {
		try {
			const id = parseInt(req.params.id);
			const user_id = req.user;

			if (!user_id) {
				throw new UnauthorizedError('Usuario no encontrado');
			}

			verifyTypes([{ value: id, type: 'number' }]);

			const post = await postService.deletePost(id, Number(user_id));

			return res.json({
				msg: 'Post eliminado con exito',
				data: post,
			});
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new PostController();
