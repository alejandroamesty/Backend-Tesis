// @deno-types="@types/express"
import { Request, Response } from 'express';
import userService from '../services/user.service.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { handleError } from '../utils/errorHandler.ts';
import { UnauthorizedError } from '../utils/errors/httpErrors.ts';

class UserController {
	async getAll(_req: Request, res: Response) {
		try {
			const users = await userService.getAllUsers();
			res.json({
				msg: 'Data encontrada con exito',
				data: users,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async getById(req: Request, res: Response) {
		try {
			const id = parseInt(req.params.id);
			const user = await userService.getUserById(id);
			res.json({
				msg: 'Data encontrada con exito',
				data: user,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async getByEmail(req: Request, res: Response) {
		try {
			const email = req.params.email;
			const user = await userService.getUserByEmail(email);
			res.json({
				msg: 'Data encontrada con exito',
				data: user,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async getByUsername(req: Request, res: Response) {
		try {
			const username = req.params.username;
			const user = await userService.getUserByUsername(username);
			res.json({
				msg: 'Data encontrada con exito',
				data: user,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async update(req: Request, res: Response) {
		try {
			const id = req.user;
			if (!id) {
				throw new UnauthorizedError('Invalid token');
			}
			const userData = req.body as {
				username?: string;
				image?: string;
				fname?: string;
				lname?: string;
				biography?: string;
				email?: string;
				password?: string;
				address?: string;
				birth_date?: Date;
			};

			verifyTypes([
				{
					value: [
						userData.username,
						userData.image,
						userData.fname,
						userData.lname,
						userData.biography,
						userData.email,
						userData.password,
						userData.address,
					],
					type: 'string',
					optional: true,
				},
			]);

			const user = await userService.updateUser(Number(id), userData);
			res.json({
				msg: 'Data actualizada con exito',
				data: user,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const id = req.user;
			if (!id) {
				throw new UnauthorizedError('Invalid token');
			}
			const user = await userService.deleteUser(Number(id));
			res.json({
				msg: 'Data eliminada con exito',
				data: user,
			});
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new UserController();
