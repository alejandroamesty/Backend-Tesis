import { MismatchTypeError } from './errors/TypeError.ts';

export function handleError(error: unknown) {
	if (error instanceof Error && typeof error === 'object' && error !== null && 'code' in error) {
		switch (Number(error.code)) {
			case 23505:
				return { code: 409, message: 'Conflict' };
			case 23502:
				return { code: 400, message: 'Bad request' };
			default:
				console.error(error);
				return { code: 500, message: 'Internal database error' };
		}
	}

	if (error instanceof TypeError) {
		console.error(error);
		return { code: 500, message: 'Internal server error' };
	}

	if (error instanceof MismatchTypeError) {
		return { code: 400, message: 'Bad request' };
	}

	return { code: 500, message: 'Internal server error' };
}
