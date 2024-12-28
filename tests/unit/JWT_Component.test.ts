import { assert } from '@std/assert';
import { generateToken, verifyToken } from '../../src/utils/JWTComponent.ts';
import { verifyTypes } from '../../src/utils/typeChecker.ts';

Deno.test('unit: JWTComponent - generateToken - generate a token', async () => {
	try {
		Deno.env.set('JWT_EXPIRES', '3600');
		Deno.env.set('JWT_SECRET', 'test');
		const token = await generateToken({ test: 'test' });
		verifyTypes({ value: token, type: 'string' });
	} catch (error) {
		console.error(error);
	}
});

Deno.test('unit: JWTComponent - verifyToken - verify a token', async () => {
	const testValue = 'test';
	Deno.env.set('JWT_EXPIRES', '3600');
	Deno.env.set('JWT_SECRET', 'test');
	const token = await generateToken({ test: testValue }, 3600);
	const payload = await verifyToken(token);

	verifyTypes([
		{ value: payload, type: 'object' },
		{ value: payload?.test, type: 'string' },
	]);
	assert(payload?.test === testValue);
});

Deno.test('unit: JWTComponent - verifyToken - verify an invalid token', async () => {
	try {
		await verifyToken('invalidToken');
		throw new Error('Token should be invalid');
	} catch (error) {
		verifyTypes({ value: error, type: 'object' });
	}
});

Deno.test('unit: JWTComponent - verifyToken - verify an expired token', async () => {
	try {
		Deno.env.set('JWT_EXPIRES', '0');
		Deno.env.set('JWT_SECRET', 'test');
		const token = await generateToken({ test: 'test' }, 0);
		await verifyToken(token);
		throw new Error('Token should be expired');
	} catch (error) {
		verifyTypes({ value: error, type: 'object' });
	}
});
