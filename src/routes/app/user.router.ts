// @deno-types="@types/express"
import Router from 'express';
import userController from '../../controllers/user.controller.ts';
import { userAuth } from '../../middlewares/userAuth.ts';

const userRouter = Router();

userRouter
	.get('/', userController.getAll)
	.get('/:id', userController.getById)
	.get('/email/:email', userController.getByEmail)
	.get('/username/:username', userController.getByUsername)
	.put('/:id', userAuth, userController.update)
	.delete('/:id', userAuth, userController.delete);

export default userRouter;
