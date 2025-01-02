import { Next, Request, Response } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: Next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	if (req.method === 'OPTIONS') {
		res.status(204).end();
		return;
	}

	next();
};

export default corsMiddleware;
