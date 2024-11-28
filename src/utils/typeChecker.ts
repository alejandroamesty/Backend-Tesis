import { MismatchTypeError } from './errors/TypeError.ts';

type BaseTypes =
	| 'string'
	| 'number'
	| 'bigint'
	| 'boolean'
	| 'symbol'
	| 'undefined'
	| 'object'
	| 'function';

type AllowedTypes =
	| BaseTypes
	| 'email'
	| 'password'
	| 'image'
	| 'video'
	| `Array<${BaseTypes}>`;

export function verifyTypes(
	data:
		| Array<{
			value: unknown | Array<unknown>;
			type: AllowedTypes;
			optional?: boolean;
		}>
		| {
			value: unknown | Array<unknown>;
			type: AllowedTypes;
			optional?: boolean;
		},
) {
	if (Array.isArray(data)) {
		for (const { value, type, optional } of data) {
			if (Array.isArray(value)) {
				for (const val of value) {
					checkType(val, type, optional);
				}
			} else {
				checkType(value, type, optional);
			}
		}
	} else {
		if (Array.isArray(data.value)) {
			for (const val of data.value) {
				checkType(val, data.type, data.optional);
			}
		} else {
			checkType(data.value, data.type, data.optional);
		}
	}
}

function checkType(value: unknown, type: string, optional?: boolean) {
	if (value === undefined && optional) {
		return;
	}

	if (!value) {
		throw new MismatchTypeError('Expected a value but got undefined or NaN');
	}

	const arrayMatch = /^Array<(.+)>$/.exec(type);

	if (arrayMatch) {
		if (!Array.isArray(value)) {
			throw new MismatchTypeError(
				`Expected type ${type} but got type ${typeof value}`,
			);
		}

		const itemType = arrayMatch[1] as AllowedTypes;
		for (const item of value) {
			checkType(item, itemType); // Recursively check each element
		}
		return;
	}

	const actualType = typeof value;

	if (type === 'image') {
		const regex = /\.(png|jpg|jpeg|webp)$/g;
		if (actualType !== 'string' || !regex.test(value as string)) {
			if (actualType !== 'string') {
				throw new MismatchTypeError(`Expected type image but got type ${actualType}`);
			}
			throw new MismatchTypeError('Invalid image');
		}
		return;
	}

	if (type === 'video') {
		const regex = /\.(mp4|webm|ogg)$/g;
		if (actualType !== 'string' || !regex.test(value as string)) {
			if (actualType !== 'string') {
				throw new MismatchTypeError(`Expected type video but got type ${actualType}`);
			}
			throw new MismatchTypeError('Invalid video');
		}
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
				throw new MismatchTypeError(
					`Expected type password but got type ${actualType}`,
				);
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
