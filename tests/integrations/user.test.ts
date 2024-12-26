import { assertEquals } from '@std/assert';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/users`
	: 'http://localhost:4000/users';

Deno.test('integration: users - users - get user by username', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/username/admin`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 200);
	const _data = await response.json();
});

Deno.test('integration: users - users - not found get user by username', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/username/invalid`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 404);
	const _data = await response.json();
});

Deno.test('integration: users - users - get user by id', async () => {
	const token = await getToken();
	//get user by username, then get user by id
	const user = await fetch(`${moduleURL}/username/admin`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const userJson = await user.json();
	const response = await fetch(`${moduleURL}/${userJson.data.user.id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 200);
	const _data = await response.json();
});

Deno.test('integration: users - users - not found get user by id', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 404);
	const _data = await response.json();
});

Deno.test('integration: users - users - put user', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			fname: 'Admin',
			lname: 'Admin',
		}),
	});
	assertEquals(response.status, 200);
	const _data = await response.json();
});

Deno.test('integration: users - users - invalid put user', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			email: 'invalid',
		}),
	});
	assertEquals(response.status, 400);
	const _data = await response.json();
});
