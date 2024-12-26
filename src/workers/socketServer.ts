import socketSetup from '../app/socket.ts';
const socketOptions = {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	},
	allowEIO3: false, // Ensure only WebSocket is used
};

const host = 'localhost';
const port = 4003;

const io = socketSetup(socketOptions);

const customIOHandler: Deno.ServeHandler = (
	request: Request,
	info: Deno.ServeHandlerInfo,
) => {
	if (request.headers.get('upgrade') === 'websocket') {
		return io.handler()(request, {
			localAddr: {
				transport: 'tcp',
				hostname: host,
				port: port,
			},
			remoteAddr: info.remoteAddr,
		});
	} else {
		console.log('NOT FOUND');
		return new Response('Not Found', { status: 404 });
	}
};

Deno.serve({
	port: port,
	hostname: host,
	onListen: () => {
		console.log(`Socket server listening on ${host}:${port}`);
	},
}, customIOHandler);
