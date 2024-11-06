// @deno-types="@types/express"
import { Request, Response } from 'express';
import authService from '../services/auth.service.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { ForbiddenError } from '../utils/errors/httpErrors.ts';
import { handleError } from '../utils/errorHandler.ts';
import { generateToken } from '../utils/JWTComponent.ts';

interface UserRequestBody {
	username: string;
	image: string;
	fname: string;
	lname: string;
	biography: string;
	email: string;
	password: string;
	address: string;
	birth_date: string;
}

class AuthController {
	async register(req: Request, res: Response) {
		try {
			const {
				username,
				image,
				fname,
				lname,
				biography,
				email,
				password,
				address,
				birth_date,
			} = req.body as UserRequestBody;

			verifyTypes([
				{
					value: [username, fname, lname],
					type: 'string',
				},
				{
					value: password,
					type: 'password',
				},
				{
					value: email,
					type: 'email',
				},
				{
					value: [image, biography, address],
					type: 'string',
					optional: true,
				},
			]);

			const userData = {
				username: username,
				image: image || null,
				fname: fname,
				lname: lname,
				biography: biography || null,
				email: email,
				password: password,
				address: address || null,
				birth_date: birth_date || null,
			};

			const user = await authService.register(userData);

			return res.json({
				message: 'Registro exitoso',
				data: { user },
			});
		} catch (error: unknown) {
			const err = handleError(error);
			return res.status(err.code).json(err.message);
		}
	}

	async login(req: Request, res: Response) {
		try {
			const { username, password } = req.body;

			verifyTypes([
				{
					value: username,
					type: 'string',
				},
				{
					value: password,
					type: 'password',
				},
			]);

			const user = await authService.login({ username, password });
			if (user === null) {
				throw new ForbiddenError('Invalid username or password');
			}

			const token = generateToken({ id: user.id });
			res.setHeader('Authorization', `Bearer ${token}`);

			return res.json({
				message: 'User logged in successfully',
				data: {
					token,
					user: {
						id: user.id,
						username: user.username,
						image: user.image,
						fname: user.fname,
						lname: user.lname,
						biography: user.biography,
						email: user.email,
						address: user.address,
						birth_date: user.birth_date,
					},
				},
			});
		} catch (error: unknown) {
			const err = handleError(error);
			return res.status(err.code).json(err.message);
		}
	}
}

export default new AuthController();
