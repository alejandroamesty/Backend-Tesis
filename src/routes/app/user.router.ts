// @deno-types="@types/express"
import Router from 'express';
import userController from '../../controllers/user.controller.ts';
import { userAuth } from '../../middlewares/userAuth.ts';

const userRouter = Router();

userRouter
	.get('/', userController.getAll)
	.get('/:id', userAuth, userController.getById)
	.get('/email/:email', userController.getByEmail)
	.get('/username/:username', userAuth, userController.getByUsername)
	.put('/', userAuth, userController.update)
	.delete('/', userAuth, userController.delete);

export default userRouter;
