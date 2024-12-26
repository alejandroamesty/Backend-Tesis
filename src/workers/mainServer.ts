/// <reference lib="deno.worker" />

import app from '../app/index.ts'; // Your app logic here

self.onmessage = (e: MessageEvent) => {
	const { port } = e.data; // Receive port from the main process
	app.listen(port, () => {
		console.log(`Main server worker listening on port ${port}`);
	});
};
