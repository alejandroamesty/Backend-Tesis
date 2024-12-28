import { verifyTypes } from '../../src/utils/typeChecker.ts';
import { MismatchTypeError } from '../../src/utils/errors/TypeError.ts';

Deno.test('unit: typeChecker - verifyTypes - verify that all types are correct', () => {
	verifyTypes([
		{ value: 'test', type: 'string' },
		{ value: 123, type: 'number' },
		{ value: 123n, type: 'bigint' },
		{ value: true, type: 'boolean' },
		{ value: Symbol('test'), type: 'symbol' },
		{ value: {}, type: 'object' },
		{ value: () => {}, type: 'function' },
		{ value: 'testEmail@email.com', type: 'email' },
		{ value: 'Password123', type: 'password' },
		{ value: '123e4567-e89b-12d3-a456-426614174000', type: 'uuid' },
		{ value: 'https://test.com/image.jpg', type: 'image' },
		{ value: 'https://test.com/video.mp4', type: 'video' },
		{ value: ['test'], type: 'Array<string>' },
		{ value: [123], type: 'Array<number>' },
		{ value: [123n], type: 'Array<bigint>' },
		{ value: [true], type: 'Array<boolean>' },
		{ value: [Symbol('test')], type: 'Array<symbol>' },
		{ value: [{}], type: 'Array<object>' },
		{ value: [() => {}], type: 'Array<function>' },
	]);
});

Deno.test('unit: typeChecker - verifyTypes - verify that base types are incorrect', () => {
	try {
		verifyTypes([
			{ value: 'test', type: 'number' },
			{ value: 123, type: 'string' },
			{ value: 123n, type: 'number' },
			{ value: true, type: 'string' },
			{ value: Symbol('test'), type: 'string' },
			{ value: {}, type: 'string' },
			{ value: () => {}, type: 'string' },
			{ value: ['test'], type: 'Array<number>' },
			{ value: [123], type: 'Array<string>' },
			{ value: [123n], type: 'Array<number>' },
			{ value: [true], type: 'Array<string>' },
			{ value: [Symbol('test')], type: 'Array<string>' },
			{ value: [{}], type: 'Array<string>' },
			{ value: [() => {}], type: 'Array<string>' },
		]);
		throw new Error('Base types should be incorrect');
	} catch (error) {
		if (error instanceof MismatchTypeError) {
			return;
		}
		throw error;
	}
});

Deno.test('unit: typeChecker - verifyTypes - verify that email is incorrect', () => {
	try {
		verifyTypes([
			{ value: 'incorrectEmail', type: 'email' },
		]);
		throw new Error('Email should be incorrect');
	} catch (error) {
		if (error instanceof MismatchTypeError) {
			return;
		}
		throw error;
	}
});

Deno.test('unit: typeChecker - verifyTypes - verify that password is incorrect', () => {
	try {
		verifyTypes([
			{ value: 'incorrectpassword', type: 'password' },
		]);
		throw new Error('Password should be incorrect');
	} catch (error) {
		if (error instanceof MismatchTypeError) {
			return;
		}
		throw error;
	}
});

Deno.test('unit: typeChecker - verifyTypes - verify that uuid is incorrect', () => {
	try {
		verifyTypes([
			{ value: 'incorrectUuid', type: 'uuid' },
		]);
		throw new Error('Uuid should be incorrect');
	} catch (error) {
		if (error instanceof MismatchTypeError) {
			return;
		}
		throw error;
	}
});

Deno.test('unit: typeChecker - verifyTypes - verify that image is incorrect', () => {
	try {
		verifyTypes([
			{ value: 'img.mp4', type: 'image' },
		]);
		throw new Error('Image should be incorrect');
	} catch (error) {
		if (error instanceof MismatchTypeError) {
			return;
		}
		throw error;
	}
});

Deno.test('unit: typeChecker - verifyTypes - verify that video is incorrect', () => {
	try {
		verifyTypes([
			{ value: 'video.jpg', type: 'video' },
		]);
		throw new Error('Video should be incorrect');
	} catch (error) {
		if (error instanceof MismatchTypeError) {
			return;
		}
		throw error;
	}
});
