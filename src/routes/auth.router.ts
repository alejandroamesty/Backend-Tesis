import authController from '../controllers/auth.controller.ts';
import Router from 'express';
import { userAuth } from '../middlewares/userAuth.ts';

const authRouter = Router();

authRouter.post('/register', authController.register)
	.post('/login', authController.login)
	.post('/forgot-password', authController.forgotPassword)
	.put('/reset-password', authController.resetPassword)
	.delete('/delete-account/', userAuth, authController.deleteAccount);

export default authRouter;
