import { Server as Io, Socket } from 'socket.io';
import { verifyToken } from '../../utils/JWTComponent.ts';
import connectedSockets from '../connectedSockets.ts';
import userService from '../../services/user.service.ts';

export default async function authenticateSocket(_Io: Io, socket: Socket) {
	const token = socket.handshake.auth.token as string;
	if (!token) {
		socket.emit('error', {
			msg: `No token provided. Must provide a token using the key 'token' in the handshake auth object.`,
		});
		socket.disconnect();
		return;
	}

	const payload = await verifyToken(token);
	if (!payload) {
		socket.emit('error', { msg: 'Invalid token' });
		socket.disconnect();
		return;
	}

	const user = await userService.getUserById(payload.id as string);
	if (!user) {
		socket.emit('error', { msg: 'Invalid token' });
		socket.disconnect();
		return;
	}

	//todo get friends

	connectedSockets.addSocket(payload.id as string, socket);

	socket.emit('authenticated', { msg: 'Authenticated successfully' });

	return payload.id;
}
