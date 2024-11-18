import app from './src/app/index.ts';

const port = Number(Deno.env.get('PORT')) || 3000;

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

new Worker(new URL('./src/workers/staticFileServer.ts', import.meta.url).href, {
	type: 'module',
});

new Worker(new URL('./src/workers/fileUploaderWorker.ts', import.meta.url).href, {
	type: 'module',
});
