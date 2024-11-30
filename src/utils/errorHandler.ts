import { MismatchTypeError } from './errors/TypeError.ts';
import {
	BadRequestError,
	ExpiredTokenError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from './errors/httpErrors.ts';
import { Response } from 'express';

export function handleError(error: unknown, res: Response) {
	switch (true) {
		case error instanceof Error &&
			typeof error === 'object' &&
			error !== null &&
			'code' in error:
			switch (Number(error.code)) {
				case 23505:
					return res.status(409).json({ msg: 'Conflicto de datos' });
				case 23502:
					return res.status(400).json({ msg: 'Solitud incorrecta' });
				case 23503:
					return res.status(400).json({ msg: 'Violacion de llave foranea' });
				default:
					console.error(error);
					return res.status(500).json({ msg: 'Error interno en base de datos' });
			}
		case error instanceof TypeError:
			console.error(error);
			return res.status(500).json({ msg: 'Error interno del servidor', data: error.message });
		case error instanceof UnauthorizedError:
			return res.status(401).json({ msg: 'Acceso no autorizado', data: error.message });
		case error instanceof ForbiddenError:
			return res.status(403).json({ msg: 'Acceso denegado', data: error.message });
		case error instanceof MismatchTypeError:
			return res.status(400).json({ msg: 'Solicitud incorrecta', data: error.message });
		case error instanceof NotFoundError:
			return res.status(404).json({ msg: 'Recurso no encontrado', data: error.message });
		case error instanceof BadRequestError:
			return res.status(400).json({ msg: 'Solicitud incorrecta', data: error.message });
		case error instanceof ExpiredTokenError:
			return res.status(401).json({ msg: 'Token expirado', data: error.message });
		default:
			console.error(error);
			if (error instanceof Error) {
				if (error.message === 'no result') {
					return res.status(404).json({ msg: 'Recurso no encontrado' });
				}
			}
			return res.status(500).json({ msg: 'Error interno del servidor' });
	}
}
