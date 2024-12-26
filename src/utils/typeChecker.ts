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
	| 'uuid'
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
				//check if the type is Array<type>
				if (/^Array<.+>$/.test(type)) {
					const itemType = type.slice(6, -1) as AllowedTypes;
					for (const val of value) {
						checkType(val, itemType, optional);
					}
					continue;
				}
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

	if (!value && (value !== false && value !== 0)) {
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

	switch (type) {
		case 'uuid': {
			const regex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/g;
			if (actualType !== 'string' || !regex.test(value as string)) {
				if (actualType !== 'string') {
					throw new MismatchTypeError(
						`Se esperaba el tipo uuid pero se obtuvo el tipo ${actualType}`,
					);
				}
				throw new MismatchTypeError('Invalid uuid');
			}
			break;
		}

		case 'email': {
			const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
			if (actualType !== 'string' || !regex.test(value as string)) {
				if (actualType !== 'string') {
					throw new MismatchTypeError(
						`Se esperaba el tipo email pero se obtuvo el tipo ${actualType}`,
					);
				}
				throw new MismatchTypeError('Invalid email');
			}
			break;
		}

		case 'password': {
			const regex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
			if (actualType !== 'string' || !regex.test(value as string)) {
				if (actualType !== 'string') {
					throw new MismatchTypeError(
						`Se esperaba el tipo password pero se obtuvo el tipo ${actualType}`,
					);
				}
				throw new MismatchTypeError(
					'La contraseña debe contener al menos una letra minúscula y una mayúscula y tener al menos 8 caracteres',
				);
			}
			break;
		}

		case 'image': {
			const regex = /\.(png|jpg|jpeg|webp)$/g;
			if (actualType !== 'string' || !regex.test(value as string)) {
				if (actualType !== 'string') {
					throw new MismatchTypeError(`Expected type image but got type ${actualType}`);
				}
				throw new MismatchTypeError('Invalid image');
			}
			break;
		}

		case 'video': {
			const regex = /\.(mp4|webm|ogg)$/g;
			if (actualType !== 'string' || !regex.test(value as string)) {
				if (actualType !== 'string') {
					throw new MismatchTypeError(`Expected type video but got type ${actualType}`);
				}
				throw new MismatchTypeError('Invalid video');
			}

			break;
		}

		default: {
			if (actualType !== type) {
				throw new MismatchTypeError(`Expected type ${type} but got type ${actualType}`);
			}
			break;
		}
	}
}
