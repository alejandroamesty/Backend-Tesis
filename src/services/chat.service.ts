import { sql } from 'kysely';
import db from '../app/db.ts';
import { NotFoundError } from '../utils/errors/httpErrors.ts';

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
		return await db.transaction().execute(async (trx) => {
			// Step 1: Fetch chats
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

			// Step 2: Fetch members for all chats
			const chatIds = chats.map((chat) => chat.chatId);
			if (chatIds.length === 0) return []; // No chats found

			const members = await trx
				.selectFrom('chat_members')
				.where('chat_members.chat_id', 'in', chatIds)
				.leftJoin('users', 'chat_members.user_id', 'users.id')
				.select([
					'chat_members.chat_id as chatId',
					'users.id as userId',
					'users.username',
					'users.fname',
					'users.lname',
					'users.image',
				])
				.execute();

			const communities = await trx
				.selectFrom('communities')
				.where('communities.chat_id', 'in', chatIds)
				.select(['communities.chat_id', 'communities.name', 'communities.image'])
				.execute();

			// Step 3: Fetch last message for each chat
			const lastMessages = await trx
				.selectFrom('chat_messages')
				.where('chat_id', 'in', chatIds)
				.select([
					'chat_id as chatId',
					'id as messageId',
					'content',
					'content_type',
					'created_at',
				])
				.distinctOn(['chat_id']) // Ensure distinct on chat_id
				.orderBy('chat_id') // Must match the DISTINCT ON column
				.orderBy('created_at', 'desc') // Secondary order to get the latest message
				.execute();

			// Step 4: Group members by chatId
			const membersByChatId = members.reduce(
				(acc, member) => {
					if (!acc[member.chatId]) acc[member.chatId] = [];
					acc[member.chatId].push({
						userId: member.userId || '',
						username: member.username || '',
						fname: member.fname || '',
						lname: member.lname || '',
						image: member.image,
					});
					return acc;
				},
				{} as Record<
					string,
					Array<{
						userId: string;
						username: string;
						fname: string;
						lname: string;
						image: string | null;
					}>
				>,
			);

			// Step 5: Map last messages by chatId
			const lastMessagesByChatId = lastMessages.reduce(
				(acc, message) => {
					acc[message.chatId] = {
						messageId: message.messageId,
						content: message.content,
						contentType: message.content_type,
						createdAt: message.created_at,
					};
					return acc;
				},
				{} as Record<
					string,
					{
						messageId: string;
						content: string;
						contentType: number;
						createdAt: Date;
					}
				>,
			);

			// Step 6: Merge chats with their members and last messages
			return chats.map((chat) => ({
				...chat,
				name: communities.find((c) => c.chat_id === chat.chatId)?.name || null,
				image: communities.find((c) => c.chat_id === chat.chatId)?.image || chat.image,
				members_nu: membersByChatId[chat.chatId || '']?.length || 0,
				members: membersByChatId[chat.chatId || ''] || [],
				lastMessage: lastMessagesByChatId[chat.chatId || -1] || null,
			}));
		});
	}

	async getChatMembers(chatId: string) {
		const response = await db
			.selectFrom('chat_members')
			.where('chat_id', '=', chatId)
			.leftJoin('users', 'chat_members.user_id', 'users.id')
			.select(['users.id', 'users.username', 'users.image'])
			.execute();

		if (response.length === 0) {
			throw new NotFoundError('Chat not found');
		}

		return response;
	}
}
export default new ChatService();
