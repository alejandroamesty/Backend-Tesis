import { MismatchTypeError } from './errors/TypeError.ts';
import { ForbiddenError, NotFoundError, UnauthorizedError } from './errors/httpErrors.ts';
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
					return res.status(404).json({ msg: 'Recurso no encontrado' });
				default:
					console.error(error);
					return res.status(500).json({ msg: 'Error interno en base de datos' });
			}
		case error instanceof TypeError:
			console.error(error);
			return res.status(500).json({ msg: 'Error interno del servidor' });
		case error instanceof UnauthorizedError:
			return res.status(401).json({ msg: 'Acceso no autorizado' });
		case error instanceof ForbiddenError:
			return res.status(403).json({ msg: 'Acceso denegado' });
		case error instanceof MismatchTypeError:
			return res.status(400).json({ msg: 'Solicitud incorrecta' });
		case error instanceof NotFoundError:
			return res.status(404).json({ msg: 'Recurso no encontrado' });
		default:
			console.error(error);
			return res.status(500).json({ msg: 'Error interno del servidor' });
	}
}
