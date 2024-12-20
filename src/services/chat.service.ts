import { sql } from 'kysely';
import db from '../app/db.ts';

class ChatService {
	async createPrivateChat(user1: string, user2: string) {
		return await db.transaction().execute(async (trx) => {
			// Insert the new chat
			const [chat] = await trx
				.insertInto('chats')
				.values({
					private_chat: true,
					description: null,
				})
				.returning('id')
				.execute();

			// Insert members for the chat
			await trx
				.insertInto('chat_members')
				.values([
					{ chat_id: chat.id, user_id: user1 },
					{ chat_id: chat.id, user_id: user2 },
				])
				.execute();

			// Return the created chat ID
			return chat.id;
		});
	}

	// contentType: 1 = text, 2 = image, 3 = video
	async insertMessage(chatId: string, userId: string, content: string, contentType: 1 | 2 | 3) {
		return await db
			.insertInto('chat_messages')
			.values({
				chat_id: chatId,
				user_id: userId,
				content_type: contentType,
				content: content,
			})
			.returning(['id', 'content', 'content_type', 'created_at'])
			.executeTakeFirstOrThrow();
	}

	async getChatMessages(chatId: string, page: number = 1, pageSize: number = 15) {
		const offset = (page - 1) * pageSize;

		const messages = await db
			.selectFrom('chat_messages')
			.where('chat_id', '=', chatId)
			.leftJoin('users', 'chat_messages.user_id', 'users.id')
			.select([
				'chat_messages.id',
				'chat_messages.content_type',
				'chat_messages.content',
				'chat_messages.created_at',

				'users.id as user_id',
				'users.username',
				'users.image',
				'users.fname',
				'users.lname',
			])
			.orderBy('chat_messages.created_at', 'desc') // Get recent messages first
			.limit(pageSize) // Limit the number of messages
			.offset(offset) // Skip messages based on the page
			.execute();

		return messages.map((message) => ({
			id: message.id,
			contentType: message.content_type,
			content: message.content,
			createdAt: message.created_at,
			user: {
				id: message.user_id,
				username: message.username,
				image: message.image,
				fname: message.fname,
				lname: message.lname,
			},
		}));
	}

	async getChats(userId: string) {
		// updated code using transactions

		return await db.transaction().execute(async (trx) => {
			// step 1: fetch chats
			const chats = await trx
				.selectFrom('chat_members')
				.where('chat_members.user_id', '=', userId)
				.leftJoin('chats', 'chat_members.chat_id', 'chats.id')
				.leftJoin('chat_members as other_members', (join) =>
					join
						.onRef('other_members.chat_id', '=', 'chats.id')
						.on('other_members.user_id', '!=', userId))
				.leftJoin('users', 'other_members.user_id', 'users.id') // Get details of the other user
				.select([
					'chats.id as chatId',
					'chats.private_chat',
					'chats.description',
					sql`CASE WHEN chats.private_chat THEN users.image ELSE NULL END`.as('image'),
				])
				.execute();

			// step 2: fetch members for all chats
			const chatIds = chats.map((chat) => chat.chatId);

			const members = await trx
				.selectFrom('chat_members')
				.where('chat_members.chat_id', 'in', chatIds)
				.leftJoin('users', 'chat_members.user_id', 'users.id')
				.select([
					'chat_members.chat_id as chatId',
					'users.id as userId',
					'users.fname',
					'users.lname',
					'users.image',
				])
				.execute();

			// step 3: group members by chatId
			const membersByChatId = members.reduce(
				(acc, member) => {
					if (!acc[member.chatId]) acc[member.chatId] = [];
					acc[member.chatId].push({
						userId: member.userId || '',
						fname: member.fname || '',
						lname: member.lname || '',
						image: member.image,
					});
					return acc;
				},
				{} as Record<
					string,
					Array<{ userId: string; fname: string; lname: string; image: string | null }>
				>,
			);

			// step 4: merge chats with their members
			return chats.map((chat) => ({
				...chat,
				members_nu: membersByChatId[chat.chatId || '']?.length || 0,
				members: membersByChatId[chat.chatId || ''] || [],
			}));
		});
	}

	async getChatMembers(chatId: string) {
		return await db
			.selectFrom('chat_members')
			.where('chat_id', '=', chatId)
			.leftJoin('users', 'chat_members.user_id', 'users.id')
			.select(['users.id', 'users.username', 'users.image'])
			.execute();
	}
}
export default new ChatService();
