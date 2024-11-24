import { NextFunction, Request, Response } from 'express';

import verifyChatMember from '../services/verifyChatMember.service.ts';
import { handleError } from '../utils/errorHandler.ts';
import { ForbiddenError } from '../utils/errors/httpErrors.ts';

export default async function verifyChatMemberMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const userId = req.user;
		const chatId = Number(req.body.chatId || req.params.chatId);

		if (!chatId || isNaN(chatId)) {
			throw new ForbiddenError('No tienes permiso para acceder a este chat');
		}

		const isMember = await verifyChatMember(userId, chatId);

		if (!isMember) {
			throw new ForbiddenError('No tienes permiso para acceder a este chat');
		}

		next();
	} catch (error) {
		handleError(error, res);
	}
}
