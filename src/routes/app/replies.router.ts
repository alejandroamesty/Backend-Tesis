import repliesController from '../../controllers/replies.controller.ts';
import Router from 'express';
import { userAuth } from '../../middlewares/userAuth.ts';

const repliesRouter = Router();

repliesRouter
	.post('/', userAuth, repliesController.postReply)
	.delete('/', userAuth, repliesController.deleteReply);

export default repliesRouter;
