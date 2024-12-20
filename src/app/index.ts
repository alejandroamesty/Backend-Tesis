// @deno-types="@types/express"
import express from 'express';
import router from '../routes/index.ts';
import cors from '../middlewares/cors.ts';

const app = express();

// middlewares
app.use(express.json())
	.use(cors)
	.use(express.urlencoded({ extended: true }))
	.use(router);

export default app;
