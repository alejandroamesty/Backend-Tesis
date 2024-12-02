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
				msg: 'Registro exitoso',
				data: { user_id: user.id },
			});
		} catch (error: unknown) {
			handleError(error, res);
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
			handleError(error, res);
		}
	}

	forgotPassword(req: Request, res: Response) {
		try {
			const { email } = req.body;

			verifyTypes([
				{
					value: email,
					type: 'email',
				},
			]);

			authService.forgotPassword(email);

			return res.json({
				msg: 'Si su correo es valido, se le enviará un correo con las instrucciones para recuperar su contraseña',
			});
		} catch (error: unknown) {
			handleError(error, res);
		}
	}

	async resetPassword(req: Request, res: Response) {
		try {
			const { email, key, password } = req.body;

			verifyTypes([
				{
					value: email,
					type: 'email',
				},
				{
					value: key,
					type: 'number',
				},
				{
					value: password,
					type: 'password',
				},
			]);

			await authService.resetPassword(email, key, password);

			return res.json({
				msg: 'Contraseña cambiada con exito',
			});
		} catch (error: unknown) {
			handleError(error, res);
		}
	}

	async deleteAccount(req: Request, res: Response) {
		try {
			const user = req.user;

			if (!user) {
				throw new ForbiddenError('No estas autorizado');
			}

			const password = req.body.password;

			verifyTypes([{ value: user, type: 'uuid' }, { value: password, type: 'password' }]);

			await authService.deleteAccount(user, password);

			return res.json({
				msg: 'Cuenta eliminada con exito',
			});
		} catch (error: unknown) {
			handleError(error, res);
		}
	}
}

export default new AuthController();
