import { assertEquals } from '@std/assert';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/auth`
	: 'http://localhost:4000/auth';

Deno.test('integration: auth - login - valid login', async () => {
	const response = await fetch(`${moduleURL}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'admin',
			password: 'Admin123',
		}),
	});
	assertEquals(response.status, 200);
	const _data = await response.json();
});

Deno.test('integration: auth - login - invalid login', async () => {
	const response = await fetch(`${moduleURL}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'admin',
			password: 'invalid',
		}),
	});
	assertEquals(response.status, 400);
	const _data = await response.json();
});

Deno.test('integration: auth - register - valid register', async () => {
	const response = await fetch(`${moduleURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			'username': 'SomeRandomUser',
			'fname': 'Jose',
			'lname': 'Chacon',
			'email': 'SomeRandomEmail@gmail.com',
			'password': 'Admin123',
		}),
	});
	assertEquals(response.status, 200);
	const _data = await response.json();
});

Deno.test('integration: auth - register - duplicate register', async () => {
	const response = await fetch(`${moduleURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			'username': 'SomeRandomUser',
			'fname': 'Jose',
			'lname': 'Chacon',
			'email': 'SomeRandomEmail@gmail.com',
			'password': 'Admin123',
		}),
	});
	assertEquals(response.status, 409);
	const _data = await response.json();
});

Deno.test('integration: auth - register - invalid register', async () => {
	const response = await fetch(`${moduleURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			'username': 'someUser',
			'fname': 'Jose',
			'lname': 'Chacon',
			'email': 'invalidEmail',
			'password': 'Admin123',
		}),
	});
	assertEquals(response.status, 400);
	const _data = await response.json();
});

Deno.test('integration: auth - unauthorized', async () => {
	const response = await fetch(`${moduleURL}/delete-account`, { // example of a protected route
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			'password': 'Admin123',
		}),
	});
	assertEquals(response.status, 401);
	const _data = await response.json();
});

Deno.test('integration: auth - delete-account - invalid delete account', async () => {
	const loginResponse = await fetch(`${moduleURL}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'SomeRandomUser',
			password: 'Admin123',
		}),
	});

	const token = (await loginResponse.json()).data.token;
	const response = await fetch(`${moduleURL}/delete-account`, { // example of a protected route
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			'password': 'invalidPassword',
		}),
	});
	assertEquals(response.status, 403);
	const _data = await response.json();
});

Deno.test('integration: auth - delete-account - valid delete account', async () => {
	const loginResponse = await fetch(`${moduleURL}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'SomeRandomUser',
			password: 'Admin123',
		}),
	});

	const token = (await loginResponse.json()).data.token;
	const response = await fetch(`${moduleURL}/delete-account`, { // example of a protected route
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			'password': 'Admin123',
		}),
	});
	assertEquals(response.status, 200);
	const _data = await response.json();
});
