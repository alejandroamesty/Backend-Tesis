const workers = [];
export default function startWorkers(basePort: number, numWorkers: number) {
	for (let i = 0; i < numWorkers; i++) {
		const worker = new Worker(new URL('./mainServer.ts', import.meta.url).href, {
			type: 'module',
			deno: { permissions: 'inherit' },
		});
		worker.postMessage({ port: basePort + i });
		workers.push(worker);
	}
}
