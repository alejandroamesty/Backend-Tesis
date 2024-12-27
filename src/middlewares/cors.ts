import { Next, Request, Response } from 'express';

const allowedOrigins = [
	'http://localhost',
	'http://localhost:8100',
	'http://localhost:8101',
	'capacitor://localhost',
];
// check if the origin is allowed
const isAllowedOrigin = (origin: string) => {
	return allowedOrigins.includes(origin);
};

export const corsMiddleware = (req: Request, res: Response, next: Next) => {
	//get request origin
	const origin = req.get('origin');
	if (origin && isAllowedOrigin(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin); // Allow the specific origin
	} // else, the origin is not allowed
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
