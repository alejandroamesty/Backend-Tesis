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
	const userResponse = await fetch(`${authURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'test',
			email: 'testemail@email.test',
			password: 'Testpassword123',
			fname: 'test',
			lname: 'test',
		}),
	});

	const user = await userResponse.json();

	const response = await fetch(`${moduleURL}/follow/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			follow: user.data.user_id,
		}),
	});
	assertEquals(response.status, 201);
	await response.body?.cancel();

	// cleanup
	const tempToken = await getToken({
		username: 'test',
		password: 'Testpassword123',
	});
	const deleteResponse = await fetch(`${authURL}/delete-account`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${tempToken}`,
		},
		body: JSON.stringify({
			password: 'Testpassword123',
		}),
	});

	await deleteResponse.body?.cancel();
});

Deno.test('integration: followers - followers - unfollow user', async () => {
	const token = await getToken();
	// get user id for username admin
	const userResponse = await fetch(`${authURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'test',
			email: 'testemail@email.test',
			password: 'Testpassword123',
			fname: 'test',
			lname: 'test',
		}),
	});

	const user = await userResponse.json();

	const followResponse = await fetch(`${moduleURL}/follow/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			follow: user.data.user_id,
		}),
	});
	assertEquals(followResponse.status, 201);
	await followResponse.body?.cancel();

	const response = await fetch(`${moduleURL}/unfollow/`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			follow: user.data.user_id,
		}),
	});
	assertEquals(response.status, 200);
	await response.body?.cancel();

	// cleanup
	const tempToken = await getToken({
		username: 'test',
		password: 'Testpassword123',
	});

	const deleteResponse = await fetch(`${authURL}/delete-account`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${tempToken}`,
		},
		body: JSON.stringify({
			password: 'Testpassword123',
		}),
	});

	await deleteResponse.body?.cancel();
});

Deno.test('integration: followers - followers/follow - not found follow', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/follow/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			follow: '00000000-0000-200a-a000-000000000000',
		}),
	});

	assertEquals(response.status, 400);
	await response.body?.cancel();
});

Deno.test('integration: followers - followers/unfollow - not found unfollow', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/unfollow/`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			follow: '00000000-0000-200a-a000-000000000000',
		}),
	});

	assertEquals(response.status, 404);
	await response.body?.cancel();
});
