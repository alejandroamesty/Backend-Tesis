import { Server as Io, Socket } from 'socket.io';
import chatService from '../../services/chat.service.ts';
import { verifyTypes } from '../../utils/typeChecker.ts';
import verifyChatMember from '../../services/verifyChatMember.service.ts';
import connectedSockets from '../connectedSockets.ts';
import { socketHandleError } from '../socketErrorHandler.ts';
import { ForbiddenError } from '../../utils/errors/httpErrors.ts';

export default function messageHandler(
	_io: Io,
	socket: Socket,
	user_id: string,
	username: string,
): void {
	socket.on('message', async (data) => {
		try {
			const { chatId, content, contentType } = data;

			console.log('Message', data);

			verifyTypes([
				{ value: chatId, type: 'uuid' },
				{ value: content, type: 'string' },
				{ value: contentType, type: 'number' },
			]);

			const chatMember = await verifyChatMember(user_id, chatId);

			if (!chatMember) {
				throw new ForbiddenError('You are not a member of this chat');
			}

			await chatService.insertMessage(chatId, user_id, content, contentType);

			//check if other members of the chat are online
			chatService.getChatMembers(chatId).then((members) => {
				members.forEach((member) => {
					if (member.id !== user_id && member.id) {
						const socket = connectedSockets.getSocket(member.id);
						if (socket) {
							socket.emit('message', {
								chatId,
								content,
								contentType,
								created_at: new Date().toISOString(),
								user_id,
								username: username,
							});
						}
					}
				});
			});
		} catch (error) {
			socketHandleError(error, socket);
		}
	});
}
