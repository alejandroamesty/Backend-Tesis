// @deno-types="@types/express"
import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/JWTComponent.ts';

export async function userAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const token = req.header('Authorization')?.split(' ')[1] || req.body.token;
		if (!token) {
			res.status(401).json({ message: 'No token provided' });
			return;
		}
		const payload = await verifyToken(token);
		if (!payload) {
			res.status(401).json({ message: 'Invalid token' });
			return;
		}
		req.user = payload.id as string;
		next();
	} catch (_error) {
		res.status(401).json({ message: 'Invalid token' });
		return;
	}
}
