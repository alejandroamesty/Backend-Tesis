import likesController from '../../controllers/likes.controller.ts';
import Router from 'express';
import { userAuth } from '../../middlewares/userAuth.ts';

const likesRouter = Router();

likesRouter
	.get('/:id', likesController.getPostLikes)
	.post('/like', userAuth, likesController.likePost)
	.delete('/unlike', userAuth, likesController.unlikePost);

export default likesRouter;
