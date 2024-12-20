import { Server as Io, Socket } from 'socket.io';
import messageHandler from './handlers/messageHandler.ts';
import authenticateSocket from './handlers/authenticateSocket.ts';
import { socketHandleError } from './socketErrorHandler.ts';

export default async function index(io: Io, socket: Socket) {
	try {
		const user_id = await authenticateSocket(io, socket);
		messageHandler(io, socket, user_id as string);
		//other handlers like message, room, etc.
	} catch (error) {
		socketHandleError(error, socket);
	}
}
