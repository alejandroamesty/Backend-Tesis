import chatsController from '../../controllers/chats.controller.ts';
import { Router } from 'express';
import { userAuth } from '../../middlewares/userAuth.ts';
import verifyChatMemberMiddleware from '../../middlewares/verifyChatMember.ts';

const chatsRouter = Router();

chatsRouter
	.get('/', userAuth, chatsController.getChats)
	.post('/private/chat', userAuth, chatsController.createPrivateChat)
	.get('/message/:chatId', userAuth, verifyChatMemberMiddleware, chatsController.getChatMessages)
	.post('/message', userAuth, verifyChatMemberMiddleware, chatsController.insertMessage);

export default chatsRouter;
