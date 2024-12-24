// @deno-types="@types/express"
import Router, { Request, Response } from 'express';
import userRouter from './app/user.router.ts';
import authRouter from './auth.router.ts';
import postRouter from './app/post.router.ts';
import reportRouter from './app/report.router.ts';
import likesRouter from './app/likes.router.ts';
import repliesRouter from './app/replies.router.ts';
import followerRouter from './app/followers.router.ts';
import chatsRouter from './app/chats.router.ts';
import communitiesRouter from './app/communities.router.ts';
import eventsRouter from './app/events.router.ts';
import searchRouter from './app/search.router.ts';
import carbonFootprintRouter from './app/calculator.router.ts';
import activitiesRouter from './app/activities.router.ts';

const router = Router();

router
	.get('/', (_req: Request, res: Response) => {
		res.send('Hello World!');
	})
	.use('/auth', authRouter)
	.use('/users', userRouter)
	.use('/posts', postRouter)
	.use('/reports', reportRouter)
	.use('/likes', likesRouter)
	.use('/replies', repliesRouter)
	.use('/followers', followerRouter)
	.use('/chats', chatsRouter)
	.use('/communities', communitiesRouter)
	.use('/events', eventsRouter)
	.use('/search', searchRouter)
	.use('/carbon-footprint', carbonFootprintRouter)
	.use('/activities', activitiesRouter);

export default router;
