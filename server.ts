import startWorkers from './src/workers/workerSpawner.ts';
import startLoadBalancer from './src/workers/loadBalancer.ts';

const mainServers = Number(Deno.env.get('WORKERS')) || navigator.hardwareConcurrency - 5;
// 5 cores for the load balancer, static file server, file uploader worker and socket server worker

startWorkers(8000, mainServers < 1 ? 1 : mainServers);

startLoadBalancer(Number(Deno.env.get('PORT')), 8000, mainServers < 1 ? 1 : mainServers);

new Worker(new URL('./src/workers/staticFileServer.ts', import.meta.url).href, {
	type: 'module',
});

new Worker(new URL('./src/workers/fileUploaderWorker.ts', import.meta.url).href, {
	type: 'module',
});

//added socket server worker
new Worker(new URL('./src/workers/socketServer.ts', import.meta.url).href, {
	type: 'module',
});
