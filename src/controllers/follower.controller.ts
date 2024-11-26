// @deno-types="@types/express"
import { Request, Response } from 'express';
import followService from '../services/follow.service.ts';
import { handleError } from '../utils/errorHandler.ts';
import { BadRequestError } from '../utils/errors/httpErrors.ts';
import { verifyTypes } from '../utils/typeChecker.ts';

class FollowerController {
	async getUserFollowers(req: Request, res: Response) {
		try {
			const userId = Number(req.params.userId);

			verifyTypes({ value: userId, type: 'number' });

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
			const follow = Number(req.body.follow);
			const userId = Number(req.user);

			verifyTypes({ value: [follow, userId], type: 'number' });

			if (follow === userId) {
				throw new BadRequestError('You cannot follow yourself');
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
			const follow = Number(req.body.follow);
			const userId = Number(req.user);

			verifyTypes({ value: [follow, userId], type: 'number' });

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
