import express from 'express';

declare global {
	namespace Express {
		export interface Request {
			user?: string; // Or adjust the type if `user` is more complex
		}
	}
}
