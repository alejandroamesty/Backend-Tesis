// @deno-types="@types/express"
import { Request, Response } from 'express';
import userService from '../services/user.service.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { handleError } from '../utils/errorHandler.ts';
import { UnauthorizedError } from '../utils/errors/httpErrors.ts';

class UserController {
	async getAll(_req: Request, res: Response) { //delete in production
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
			const user_id = req.user;
			if (!user_id) {
				throw new UnauthorizedError('No estas autorizado para realizar esta accion');
			}
			const id = req.params.id;
			verifyTypes({ value: id, type: 'uuid' });
			const user = await userService.getUserById(id, user_id);
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
			verifyTypes({ value: email, type: 'email' });
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
			const id = req.user;
			if (!id) {
				throw new UnauthorizedError('No estas autorizado para realizar esta accion');
			}
			const username = req.params.username;
			verifyTypes({ value: username, type: 'string' });
			const user = await userService.getUserByUsername(username, id);
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
				throw new UnauthorizedError('No estas autorizado para realizar esta accion');
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
				{ value: id, type: 'uuid' },
				{
					value: [
						userData.username,
						userData.image,
						userData.fname,
						userData.lname,
						userData.biography,
						userData.address,
						userData.birth_date,
					],
					type: 'string',
					optional: true,
				},
				{ value: userData.email, type: 'email', optional: true },
				{ value: userData.password, type: 'password', optional: true },
			]);

			const user = await userService.updateUser(id, userData);
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
				throw new UnauthorizedError('No estas autorizado para realizar esta accion');
			}

			verifyTypes({ value: id, type: 'uuid' });
			const user = await userService.deleteUser(id);
			console.log(user);
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
