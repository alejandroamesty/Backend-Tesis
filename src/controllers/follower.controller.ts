// @deno-types="@types/express"
import { Request, Response } from 'express';
import followService from '../services/follow.service.ts';
import { handleError } from '../utils/errorHandler.ts';
import { BadRequestError, ForbiddenError } from '../utils/errors/httpErrors.ts';
import { verifyTypes } from '../utils/typeChecker.ts';

class FollowerController {
	async getUserFollowers(req: Request, res: Response) {
		try {
			const userId = req.params.userId;

			verifyTypes({ value: userId, type: 'uuid' });

			const followers = await followService.getFollowers(userId);

			res.status(200).json({
				msg: 'Seguidores encontrados con exito',
				data: {
					followers_nu: followers.length,
					followers,
				},
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async followUser(req: Request, res: Response) {
		try {
			const follow = req.body.follow;
			const userId = req.user;

			verifyTypes({ value: [follow, userId], type: 'uuid' });

			if (follow === userId) {
				throw new BadRequestError('No te puedes seguir a ti mismo');
			}

			if (!userId) {
				throw new ForbiddenError('Debes estar logueado para seguir a un usuario');
			}

			const result = await followService.followUser(follow, userId);

			res.status(201).json({
				msg: 'Usuario seguido con exito',
				data: result,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async unfollowUser(req: Request, res: Response) {
		try {
			const follow = req.body.follow;
			const userId = req.user;

			verifyTypes({ value: [follow, userId], type: 'uuid' });

			if (!userId) {
				throw new ForbiddenError('Debes estar logueado para dejar de seguir a un usuario');
			}

			const result = await followService.unfollowUser(follow, userId);

			res.status(200).json({
				msg: 'Usuario dejado de seguir con exito',
				data: result,
			});
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new FollowerController();
