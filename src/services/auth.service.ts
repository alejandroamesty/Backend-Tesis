import db from '../app/db.ts';
import { getForgotPasswordTemplate } from '../templates/forgotPassword.template.ts';
import { ForbiddenError } from '../utils/errors/httpErrors.ts';
import hasher from '../utils/hasher.ts';
import keysHandler from '../utils/keysHandler.ts';
import mailer from '../utils/mailer.ts';

class AuthService {
	async register(data: {
		username: string;
		image: string | null;
		fname: string;
		lname: string;
		biography: string | null;
		email: string;
		password: string;
		address: string | null;
		birth_date: string | null;
	}) {
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
		} = data;

		const hashedPassword = await hasher.hash(password, 4);

		const result = await db
			.insertInto('users')
			.values({
				username,
				image,
				fname,
				lname,
				biography,
				email,
				password: hashedPassword,
				address,
				birth_date: birth_date ? new Date(birth_date) : null,
			})
			.returning([
				'id',
				'username',
				'image',
				'fname',
				'lname',
				'biography',
				'email',
				'address',
				'birth_date',
			])
			.executeTakeFirstOrThrow();

		return result;
	}

	async login(data: { username: string; password: string }) {
		const { username, password } = data;

		const user = await db
			.selectFrom('users')
			.selectAll()
			.where('username', '=', username)
			.where('deleted_at', 'is', null)
			.executeTakeFirst();

		if (!user) {
			return null;
		}

		const hashedPassword = user.password;
		const isPasswordCorrect = await hasher.verify(password, hashedPassword);

		if (!isPasswordCorrect) {
			return null;
		}

		return user;
	}

	async forgotPassword(email: string) {
		const user = await db
			.selectFrom('users')
			.select('id')
			.where('email', '=', email)
			.where('deleted_at', 'is', null)
			.executeTakeFirst();

		if (!user) {
			return;
		}

		const key = keysHandler.generateKey(user.id);
		const html = getForgotPasswordTemplate(key);

		mailer.sendEmail({
			email: email,
			type: 'html',
			subject: 'Recuperar contraseña',
			body: html,
		});
	}

	async verifyKey(email: string, key: number) {
		const user = await db
			.selectFrom('users')
			.select('id')
			.where('email', '=', email)
			.where('deleted_at', 'is', null)
			.executeTakeFirst();

		if (!user) {
			throw new ForbiddenError('Codigo invalido');
		}

		const isKeyValid = keysHandler.verifyKey(user.id, key);

		if (!isKeyValid) {
			throw new ForbiddenError('Codigo invalido');
		}

		return true;
	}

	async resetPassword(email: string, key: number, password: string) {
		await db.transaction().execute(async (trx) => {
			const user = await trx
				.selectFrom('users')
				.select('id')
				.where('email', '=', email)
				.where('deleted_at', 'is', null)
				.executeTakeFirst();

			if (!user) {
				throw new ForbiddenError('Codigo invalido'); // this is saying that the email is valid because of security reasons
			}

			const isKeyValid = keysHandler.verifyKey(user.id, key);

			if (!isKeyValid) {
				throw new ForbiddenError('Codigo invalido');
			}

			const hashedPassword = await hasher.hash(password, 4);

			await trx
				.updateTable('users')
				.set('password', hashedPassword)
				.where('id', '=', user.id)
				.executeTakeFirstOrThrow();

			keysHandler.deleteKey(user.id);
		});
		return true;
	}

	async deleteAccount(userId: string, password: string) {
		const result = await db.transaction().execute(async (trx) => {
			const user = await trx
				.selectFrom('users')
				.select(['id', 'password'])
				.where('id', '=', userId)
				.where('deleted_at', 'is', null)
				.executeTakeFirst();

			if (!user) {
				throw new ForbiddenError('No estas autorizado');
			}

			const isPasswordCorrect = await hasher.verify(password, user.password);

			if (!isPasswordCorrect) {
				throw new ForbiddenError('No estas autorizado');
			}

			await trx
				.updateTable('users')
				.set('deleted_at', new Date())
				.where('id', '=', userId)
				.where('deleted_at', 'is', null)
				.executeTakeFirstOrThrow();

			return true;
		});

		return result;
	}
}

export default new AuthService();
