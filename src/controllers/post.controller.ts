// @deno-types="@types/express"
import { Request, Response } from 'express';
import postService from '../services/post.service.ts';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { BadRequestError, NotFoundError } from '../utils/errors/httpErrors.ts';
import { UnauthorizedError } from '../utils/errors/httpErrors.ts';

class PostController {
	async getPosts(req: Request, res: Response) {
		const user = req.user;
		const page = isNaN(Number(req.query.page)) ? undefined : Number(req.query.page);
		try {
			verifyTypes([
				{ value: page, type: 'number', optional: true },
				{ value: user, type: 'uuid' },
			]);
			if (page && page < 1) {
				throw new BadRequestError('El numero de pagina debe ser mayor a 0');
			}
			const posts = await postService.getPosts(user as string, page ?? undefined);

			res.json({
				msg: 'Data encontrada con exito',
				data: posts,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async getPost(req: Request, res: Response) {
		try {
			const userId = req.user;
			const id = req.params.id;

			if (!userId) {
				throw new UnauthorizedError('Usuario no encontrado');
			}

			verifyTypes({ value: [id, userId], type: 'uuid' });
			const post = await postService.getPost(id, userId);
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
			const { caption, coordinates, content, videos, images } = req.body;
			const x = coordinates?.x || undefined;
			const y = coordinates?.y || undefined;
			const user_id = req.user;

			if (!user_id) {
				throw new UnauthorizedError('Usuario no encontrado');
			}

			verifyTypes([
				{ value: [caption, content], type: 'string' },
				{ value: [x, y], type: 'number', optional: true },
				{ value: videos, type: 'video', optional: true },
				{ value: images, type: 'image', optional: true },
			]);

			const post = await postService.createPost({
				post_data: {
					caption: caption as string,
					user_id: user_id,
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
			console.log(error);
			handleError(error, res);
		}
	}

	async deletePost(req: Request, res: Response) {
		try {
			const id = req.params.id;
			const user_id = req.user;

			if (!user_id) {
				throw new UnauthorizedError('Usuario no encontrado');
			}

			verifyTypes({ value: [id, user_id], type: 'uuid' });

			const post = await postService.deletePost(id, user_id);

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
