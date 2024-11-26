import { handleError } from '../utils/errorHandler.ts';
import { Request, Response } from 'express';
import chatService from '../services/chat.service.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { MismatchTypeError } from '../utils/errors/TypeError.ts';

class ChatController {
	async createPrivateChat(req: Request, res: Response) {
		try {
			const user1 = Number(req.user);
			const { user } = req.body;

			verifyTypes([{ value: [user, user1], type: 'number' }]);

			const chatId = await chatService.createPrivateChat(user1, user);

			res.status(201).json({
				msg: 'Chat creado con exito',
				data: {
					chatId,
				},
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async insertMessage(req: Request, res: Response) {
		try {
			const userId = Number(req.user);
			const { chatId, content, contentType } = req.body;

			verifyTypes([
				{ value: [chatId, contentType, userId], type: 'number' },
				{ value: content, type: 'string' },
			]);

			// 1: Texto, 2: Imagen, 3: Video
			if (0 > contentType || contentType > 3) {
				throw new MismatchTypeError('contentType solo puede ser 1 | 2 | 3');
			}

			const message = await chatService.insertMessage(chatId, userId, content, contentType);

			res.status(201).json({
				msg: 'Mensaje enviado con exito',
				data: message,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async getChats(req: Request, res: Response) {
		try {
			const userId = Number(req.user);

			const chats = await chatService.getChats(userId);

			res.status(200).json({
				msg: 'Chats encontrados con exito',
				data: chats,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async getChatMessages(req: Request, res: Response) {
		try {
			const chatId = Number(req.params.chatId);
			let page = Number(req.query.page as string);

			verifyTypes([
				{ value: chatId, type: 'number' },
				{
					value: page,
					type: 'number',
					optional: true,
				},
			]);
			if (isNaN(page)) {
				page = 1;
			}

			const messages = await chatService.getChatMessages(chatId, page);

			res.status(200).json({
				msg: 'Mensajes encontrados con exito',
				data: messages,
			});
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new ChatController();
