import { assertEquals } from '@std/assert/equals';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/followers`
	: 'http://localhost:4000/followers';

const authURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/auth`
	: 'http://localhost:4000/auth';

const userURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/users`
	: 'http://localhost:4000/users';

Deno.test('integration: followers - followers - get user followers', async () => {
	const token = await getToken();
	// get user id for username admin
	const userResponse = await fetch(`${userURL}/username/admin`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const id = (await userResponse.json()).data.user.id;

	const response = await fetch(`${moduleURL}/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 200);
	await response.body?.cancel();
});

Deno.test('integration: followers - followers - get user following', async () => {
	const token = await getToken();
	// get user id for username admin
	const userResponse = await fetch(`${userURL}/username/admin`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const id = (await userResponse.json()).data.user.id;

	const response = await fetch(`${moduleURL}/following/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 200);
	await response.body?.cancel();
});

Deno.test('integration: followers - followers - follow yourself', async () => {
	const token = await getToken();
	// get user id for username admin
	const userResponse = await fetch(`${userURL}/username/admin`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const id = (await userResponse.json()).data.user.id;

	const response = await fetch(`${moduleURL}/follow/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			follow: id,
		}),
	});
	assertEquals(response.status, 400);
	await response.body?.cancel();
});

Deno.test('integration: followers - followers - follow user', async () => {
	const token = await getToken();
	// get user id for username admin
	const userResponse = await fetch(`${authURL}/registeer`, {});

	const response = await fetch(`${moduleURL}/follow/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			follow: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
		}),
	});
	assertEquals(response.status, 200);
	await response.body?.cancel();
});
