import { MismatchTypeError } from './errors/TypeError.ts';

type AllowedTypes =
	| 'string'
	| 'email'
	| 'password'
	| 'number'
	| 'bigint'
	| 'boolean'
	| 'symbol'
	| 'undefined'
	| 'object'
	| 'function';

export function verifyTypes(
	data: Array<{ value: unknown | Array<unknown>; type: AllowedTypes; optional?: boolean }>,
) {
	for (const { value, type, optional } of data) {
		if (Array.isArray(value)) {
			for (const val of value) {
				checkType(val, type, optional);
			}
		} else {
			checkType(value, type, optional);
		}
	}
}

function checkType(value: unknown, type: string, optional?: boolean) {
	const actualType = typeof value;
	if (value === undefined && optional) {
		return;
	}

	if (type === 'email') {
		const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
		if (actualType !== 'string' || !regex.test(value as string)) {
			if (actualType !== 'string') {
				throw new MismatchTypeError(`Expected type email but got type ${actualType}`);
			}
			throw new MismatchTypeError('Invalid email');
		}
	} else if (type === 'password') {
		const regex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
		if (actualType !== 'string' || !regex.test(value as string)) {
			if (actualType !== 'string') {
				throw new MismatchTypeError(`Expected type password but got type ${actualType}`);
			}
			throw new MismatchTypeError(
				'Password must contain at least one lowercase and one uppercase letter and be at least 8 characters long',
			);
		}
	} else {
		if (actualType !== type) {
			throw new MismatchTypeError(`Expected type ${type} but got type ${actualType}`);
		}
	}
}
