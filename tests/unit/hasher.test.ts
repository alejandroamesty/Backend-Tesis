import hasher from '../../src/utils/hasher.ts';
import { verifyTypes } from '../../src/utils/typeChecker.ts';

Deno.test('unit: hasher - hash - hash a string', async () => {
	const hash = await hasher.hash('test', 5);
	verifyTypes({ value: hash, type: 'string' });
});

Deno.test('unit: hasher - verify - verify a hash', async () => {
	const hash = await hasher.hash('test', 5);
	const verify = await hasher.verify('test', hash);
	if (!verify) {
		throw new Error('Hash should be verified');
	}
});

Deno.test('unit: hasher - verify - verify an invalid hash', async () => {
	const hash = await hasher.hash('test', 5);
	const verify = await hasher.verify('invalid', hash);
	if (verify) {
		throw new Error('Hash should be invalid');
	}
});
