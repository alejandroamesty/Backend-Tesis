import { verifyTypes } from '../../src/utils/typeChecker.ts';
import { MismatchTypeError } from '../../src/utils/errors/TypeError.ts';

Deno.test('unit: typeChecker - verifyTypes - verify that all types are correct', () => {
	const data = [
		{ value: 'test', type: 'string' },
		{ value: 123, type: 'number' },
		{ value: 123n, type: 'bigint' },
		{ value: true, type: 'boolean' },
		{ value: Symbol('test'), type: 'symbol' },
		{ value: undefined, type: 'undefined' },
		{ value: {}, type: 'object' },
		{ value: () => {}, type: 'function' },
		{ value: 'testEmail@email.com', type: 'email' },
		{ value: 'password123', type: 'password' },
		{ value: '123e4567-e89b-12d3-a456-426614174000', type: 'uuid' },
		{ value: 'https://test.com/image.jpg', type: 'image' },
		{ value: 'https://test.com/video.mp4', type: 'video' },
		{ value: ['test'], type: 'Array<string>' },
		{ value: [123], type: 'Array<number>' },
		{ value: [123n], type: 'Array<bigint>' },
		{ value: [true], type: 'Array<boolean>' },
		{ value: [Symbol('test')], type: 'Array<symbol>' },
		{ value: [undefined], type: 'Array<undefined>' },
		{ value: [{}], type: 'Array<object>' },
		{ value: [() => {}], type: 'Array<function>' },
	];
});
