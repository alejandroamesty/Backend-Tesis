import { Server as Io, Socket } from 'socket.io';
import chatService from '../../services/chat.service.ts';
import { verifyTypes } from '../../utils/typeChecker.ts';
import verifyChatMember from '../../services/verifyChatMember.service.ts';
import connectedSockets from '../connectedSockets.ts';

export default function messageHandler(_io: Io, socket: Socket, user_id: string): void {
	socket.on('message', (data) => {
		const { chatId, content, contentType } = data;

		verifyTypes([
			{ value: chatId, type: 'uuid' },
			{ value: content, type: 'string' },
			{ value: contentType, type: 'number' },
		]);

		verifyChatMember(user_id, chatId);

		chatService.insertMessage(chatId, user_id, content, contentType);

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
						});
					}
				}
			});
		});
	});
}
