import { MismatchTypeError } from '../utils/errors/TypeError.ts';
import {
	BadRequestError,
	ExpiredTokenError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from '../utils/errors/httpErrors.ts';
import { Socket } from 'socket.io';

export function socketHandleError(error: unknown, socket: Socket) {
	switch (true) {
		case error instanceof Error &&
			typeof error === 'object' &&
			error !== null &&
			'code' in error:
			switch (Number(error.code)) {
				case 23505:
					return socket.emit('error', { msg: 'Conflicto de datos' });
				case 23502:
					return socket.emit('error', { msg: 'Solicitud incorrecta' });
				case 23503:
					return socket.emit('error', { msg: 'Violacion de llave foranea' });
				default:
					console.error(error);
					return socket.emit('error', { msg: 'Error interno en base de datos' });
			}
		case error instanceof TypeError:
			console.error(error);
			return socket.emit('error', { msg: 'Error interno del servidor', data: error.message });
		case error instanceof UnauthorizedError:
			return socket.emit('error', { msg: 'Acceso no autorizado', data: error.message });
		case error instanceof ForbiddenError:
			return socket.emit('error', { msg: 'Acceso denegado', data: error.message });
		case error instanceof MismatchTypeError:
			return socket.emit('error', { msg: 'Solicitud incorrecta', data: error.message });
		case error instanceof NotFoundError:
			return socket.emit('error', { msg: 'Recurso no encontrado', data: error.message });
		case error instanceof BadRequestError:
			return socket.emit('error', { msg: 'Solicitud incorrecta', data: error.message });
		case error instanceof ExpiredTokenError:
			return socket.emit('error', { msg: 'Token expirado', data: error.message });
		default:
			console.error(error);
			if (error instanceof Error) {
				if (error.message === 'no result') {
					return socket.emit('error', { msg: 'Recurso no encontrado' });
				}
			}
			return socket.emit('error', { msg: 'Error interno del servidor' });
	}
}
