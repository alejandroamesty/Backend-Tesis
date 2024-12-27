import Express from 'express';
import { Request, Response } from 'express';
import { Buffer } from 'node:buffer';

const app = Express();
const port = 8100;

app.use(Express.json());

app.get('/', (_req: Request, res: Response) => {
	res.set('Content-Type', 'text/html');
	res.send(Buffer.from(`
		<!DOCTYPE html>
		<html>
			<head>
				<title>HTML Server Test</title>
			</head>
			<body>
				<h1>HTML Server Test</h1>
				<p>This is a test of the HTML server.</p>
				<p>Upload a file:</p>
				<form action="/upload" method="post" enctype="multipart/form-data">
					<input type="file" name="file" />
					<input type="submit" value="Upload" />
				</form>

				<script>
					const form = document.querySelector('form');
					form.addEventListener('submit', async (event) => {
						event.preventDefault();
						const formData = new FormData(form);
						const response = await fetch('http://localhost:4002', {
							method: 'POST',
							body: formData,
						});
						const data = await response.json();
						console.log(data);
					}
				</script>
			</body>
		</html>
	`));
});

app.listen(port, () => {
	console.log(`HTML Server running on http://localhost:${port}/`);
});
