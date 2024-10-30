// @deno-types="@types/express"
import { Request, Response } from 'express';
import userService from '../services/user.service.ts';
import { verifyTypes } from '../utils/typeChecker.ts';

class UserController {
	async getAll(_req: Request, res: Response) {
		const users = await userService.getAllUsers();
		res.json(users);
	}

	async getById(req: Request, res: Response) {
		const id = parseInt(req.params.id);
		const user = await userService.getUserById(id);
		res.json(user);
	}

	async getByEmail(req: Request, res: Response) {
		const email = req.params.email;
		const user = await userService.getUserByEmail(email);
		res.json(user);
	}

	async getByUsername(req: Request, res: Response) {
		const username = req.params.username;
		const user = await userService.getUserByUsername(username);
		res.json(user);
	}

	async update(req: Request, res: Response) {
		const id = req.user;
		if (!id) {
			res.status(401).json({ message: 'Invalid token' });
			return;
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
		res.json(user);
	}

	async delete(req: Request, res: Response) {
		const id = req.user;
		if (!id) {
			res.status(401).json({ message: 'Invalid token' });
			return;
		}
		const user = await userService.deleteUser(Number(id));
		res.json(user);
	}
}

export default new UserController();
