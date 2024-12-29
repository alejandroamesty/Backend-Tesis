import { Server as Io, Socket } from 'socket.io';
import { verifyToken } from '../../utils/JWTComponent.ts';
import connectedSockets from '../connectedSockets.ts';
import userService from '../../services/user.service.ts';
import { ForbiddenError } from '../../utils/errors/httpErrors.ts';

export default async function authenticateSocket(_Io: Io, socket: Socket) {
	const token = socket.handshake.auth.token as string;
	if (!token) {
		socket.emit('error', {
			msg: `No token provided. Must provide a token using the key 'token' in the handshake auth object.`,
		});
		socket.disconnect();
		throw new ForbiddenError('No token provided');
	}

	const payload = await verifyToken(token);
	if (!payload) {
		socket.emit('error', { msg: 'Invalid token' });
		socket.disconnect();
		throw new ForbiddenError('Invalid token');
	}

	const user = await userService.getUserById(payload.id as string);
	if (!user) {
		socket.emit('error', { msg: 'Invalid token' });
		socket.disconnect();
		throw new ForbiddenError('Invalid token');
	}

	connectedSockets.addSocket(payload.id as string, socket);

	socket.emit('authenticated', { msg: 'Authenticated successfully' });

	return { id: payload.id as string, username: user.user?.username || 'unknown' };
}
