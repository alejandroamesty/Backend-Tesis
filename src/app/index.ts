// @deno-types="@types/express"
import express from 'express';
import router from '../routes/index.ts';

const app = express();

// middlewares
app.use(express.json())
	.use(express.urlencoded({ extended: true }))
	.use(router);

export default app;
