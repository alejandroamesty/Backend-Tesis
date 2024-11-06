import { MismatchTypeError } from './errors/TypeError.ts';
import { ForbiddenError, UnauthorizedError } from './errors/httpErrors.ts';

export function handleError(error: unknown) {
	switch (true) {
		case error instanceof Error &&
			typeof error === 'object' &&
			error !== null &&
			'code' in error:
			switch (Number(error.code)) {
				case 23505:
					return { code: 409, message: 'Conflicto de datos' };
				case 23502:
					return { code: 400, message: 'Solitud incorrecta' };
				default:
					console.error(error);
					return { code: 500, message: 'Error interno en base de datos' };
			}
		case error instanceof TypeError:
			console.error(error);
			return { code: 500, message: 'Internal server error' };
		case error instanceof UnauthorizedError:
			return { code: 401, message: 'Acceso no autorizado' };
		case error instanceof ForbiddenError:
			return { code: 403, message: 'Acceso denegado' };
		case error instanceof MismatchTypeError:
			return { code: 400, message: 'Solicitud incorrecta' };
		default:
			return { code: 500, message: 'Error interno del servidor' };
	}
}
