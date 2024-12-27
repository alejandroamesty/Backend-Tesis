import Express from 'express';
import { Request, Response } from 'express';
import { Buffer } from 'node:buffer';

const app = Express();
const port = 8100;

app.use(Express.json());

app.get('/', (req: Request, res: Response) => {
	res.set('Content-Type', 'text/html');
	res.send(Buffer.from('<h2>Test String</h2>'));
});
