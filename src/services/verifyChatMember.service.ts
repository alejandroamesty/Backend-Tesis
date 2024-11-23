import db from '../app/db.ts';
import { ForbiddenError } from '../utils/errors/httpErrors.ts';

export default async function verifyChatMember(userId: number, chatId: number) {
	const isMember = await db
		.selectFrom('chat_members')
		.where('chat_id', '=', chatId)
		.where('user_id', '=', userId)
		.select(['id'])
		.executeTakeFirst();

	if (!isMember) {
		throw new ForbiddenError('No tienes permiso para acceder a este chat');
	}

	return true;
}
