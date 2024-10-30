// @deno-types="@types/express"
import Router, { Request, Response } from 'express';
import userRouter from './user.router.ts';
import authRouter from './auth.router.ts';

const router = Router();

router
	.get('/', (_req: Request, res: Response) => {
		res.send('Hello World!');
	})
	.use('/auth', authRouter)
	.use('/user', userRouter);

export default router;
