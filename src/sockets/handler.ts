import { Server as Io, Socket } from 'socket.io';

export default function example(_io: Io, socket: Socket): void {
	socket.on('test', (data) => {
		console.log('Test event', data);
	});
}
