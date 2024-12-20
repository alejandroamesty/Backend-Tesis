import { Next, Request, Response } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: Next) => {
	res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, OPTIONS',
	); // Allow specific methods
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization',
	); // Allow specific headers

	// Handle preflight requests
	if (req.method === 'OPTIONS') {
		res.status(204).end(); // No Content
		return;
	}

	next(); // Continue to the next middleware
};

export default corsMiddleware;
