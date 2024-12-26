import { assertEquals } from '@std/assert/equals';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/search`
	: 'http://localhost:4000/search';

Deno.test('integration: search - search - get search', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}?parameter=test&page=1`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 200);
	const _data = await response.body?.cancel();
});
