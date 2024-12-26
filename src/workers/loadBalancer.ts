import { serve } from 'https://deno.land/std@0.150.0/http/server.ts';

export default function startLoadBalancer(
	port: number,
	workersPort: number,
	workerNumbers: number,
) {
	const workers: number[] = [];
	let currentWorker = 0;
	for (let i = 0; i < workerNumbers; i++) {
		workers.push(workersPort + i);
	}
	serve(async (req) => {
		const targetPort = workers[currentWorker];
		currentWorker = (currentWorker + 1) % workers.length;

		const url = new URL(req.url);
		url.port = targetPort.toString();

		const response = await fetch(url.toString(), {
			method: req.method,
			headers: req.headers,
			body: req.body,
		});

		return new Response(await response.text(), {
			status: response.status,
			headers: response.headers,
		});
	}, {
		port: port,
		onListen: () => {
			console.log('Balancer running on port 4000');
		},
	});
}
