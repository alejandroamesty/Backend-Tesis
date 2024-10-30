import db from '../app/db.ts';
import hasher from '../utils/hasher.ts';

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
		birth_date: Date | null;
	}) {
		const { username, image, fname, lname, biography, email, password, address, birth_date } =
			data;

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
				birth_date,
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
}

export default new AuthService();
