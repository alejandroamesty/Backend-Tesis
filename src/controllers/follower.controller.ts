// @deno-types="@types/express"
import { Request, Response } from 'express';
import followService from '../services/follow.service.ts';
import { handleError } from '../utils/errorHandler.ts';
import { ForbiddenError, UnauthorizedError } from '../utils/errors/httpErrors.ts';

class FollowerController {
	async getUserFollowers(req: Request, res: Response) {
		try {
			const { userId } = req.params;

			const followers = await followService.getFollowers(parseInt(userId));

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
			const { follow } = req.body;
			const userId = req.user;
			if (!userId) {
				throw new UnauthorizedError('Unauthorized');
			}

			if (follow === Number(userId)) {
				throw new ForbiddenError('You cannot follow yourself');
			}

			const result = await followService.followUser(follow, Number(userId));

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
			const { follow } = req.body;
			const userId = req.user;
			if (!userId) {
				throw new UnauthorizedError('Unauthorized');
			}

			const result = await followService.unfollowUser(follow, Number(userId));

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
