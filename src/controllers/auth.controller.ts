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

			console.log('verifying types');
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
			console.log('types verified');

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

			console.log('registering user');
			const user = await authService.register(userData);

			return res.json({
				msg: 'Registro exitoso',
				data: { user_id: user.id },
			});
		} catch (error: unknown) {
			console.log(error);
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

			const token = await generateToken({ id: user.id });
			res.setHeader('Authorization', `Bearer ${token}`);

			return res.json({
				msg: 'Usuario logueado con exito',
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
