import keysHandler from '../../src/utils/keysHandler.ts';

Deno.test('unit: keysHandler - generateKey - generate a key', () => {
	const key = keysHandler.generateKey('test');
	if (typeof key !== 'number') {
		throw new Error('Key should be a number');
	}
	keysHandler.deleteKey('test');
});

Deno.test('unit: keysHandler - verifyKey - verify a key', () => {
	const key = keysHandler.generateKey('test');
	if (!keysHandler.verifyKey('test', key)) {
		throw new Error('Key should be verified');
	}
	keysHandler.deleteKey('test');
});

Deno.test('unit: keysHandler - deleteKey - delete a key', () => {
	const key = keysHandler.generateKey('test');
	keysHandler.deleteKey('test');
	if (keysHandler.verifyKey('test', key)) {
		throw new Error('Key should be deleted');
	}
});

Deno.test('unit: keysHandler - verifyKey - verify a key that does not exist', () => {
	if (keysHandler.verifyKey('test', 123)) {
		throw new Error('Key should not be verified');
	}
});
