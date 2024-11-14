import postController from '../../controllers/post.controller.ts';
import Router from 'express';

const postRouter = Router();

postRouter.get('/:id', postController.getPost);

export default postRouter;
