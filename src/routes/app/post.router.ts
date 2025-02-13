import postController from '../../controllers/post.controller.ts';
import Router from 'express';
import { userAuth } from '../../middlewares/userAuth.ts';

const postRouter = Router();

postRouter
	.get('/', userAuth, postController.getPosts)
	.get('/following', userAuth, postController.getFollowigPosts)
	.get('/popular', userAuth, postController.getPopularPosts)
	.get('/:id', userAuth, postController.getPost)
	.post('/', userAuth, postController.createPost)
	.delete('/:id', userAuth, postController.deletePost);

export default postRouter;
