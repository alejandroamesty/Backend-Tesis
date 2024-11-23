// @deno-types="@types/express"
import Router, { Request, Response } from 'express';
import userRouter from './app/user.router.ts';
import authRouter from './auth.router.ts';
import postRouter from './app/post.router.ts';
import likesRouter from './app/likes.router.ts';
import repliesRouter from './app/replies.router.ts';
import followerRouter from './app/followers.router.ts';
import chatsRouter from './app/chats.router.ts';

const router = Router();

router
	.get('/', (_req: Request, res: Response) => {
		res.send('Hello World!');
	})
	.use('/auth', authRouter)
	.use('/users', userRouter)
	.use('/posts', postRouter)
	.use('/likes', likesRouter)
	.use('/replies', repliesRouter)
	.use('/followers', followerRouter)
	.use('/chats', chatsRouter);

export default router;
