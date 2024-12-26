import { assertEquals } from '@std/assert';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/chats`
	: 'http://localhost:4000/chats';

const authURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/auth`
	: 'http://localhost:4000/auth';

Deno.test('integration: chats - chats - get chats', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 200);
	await response.body?.cancel();
});

Deno.test('integration: chats - chats - create private chat', async () => {
	const token = await getToken();
	//create a user
	const userResponse = await fetch(`${authURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'testuser',
			password: 'Password123',
			email: 'testemail@email.com',
			fname: 'test',
			lname: 'user',
		}),
	});
	const user = await userResponse.json();
	const response = await fetch(`${moduleURL}/private/chat`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			user: user.data.user_id,
		}),
	});
	assertEquals(response.status, 201);

	await response.body?.cancel();

	//delete the user
	const tempToken = await getToken({ username: 'testuser', password: 'Password123' });
	const deleteUserResponse = await fetch(`${authURL}/delete-account`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${tempToken}`,
		},
		body: JSON.stringify({
			password: 'Password123',
		}),
	});

	deleteUserResponse.body?.cancel();
});

Deno.test('integration: chats - chats - get chat messages', async () => {
	const token = await getToken();
	//create a user',
	const userResponse = await fetch(`${authURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'testuser',
			password: 'Password123',
			email: 'testemail@test.com',
			fname: 'test',
			lname: 'user',
		}),
	});
	const user = await userResponse.json();
	const chatResponse = await fetch(`${moduleURL}/private/chat`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			user: user.data.user_id,
		}),
	});
	const chat = await chatResponse.json();

	const response = await fetch(`${moduleURL}/message/${chat.data.chatId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	await response.body?.cancel();

	//delete the user
	const tempToken = await getToken({ username: 'testuser', password: 'Password123' });
	const deleteUserResponse = await fetch(`${authURL}/delete-account`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${tempToken}`,
		},
		body: JSON.stringify({
			password: 'Password123',
		}),
	});

	deleteUserResponse.body?.cancel();
});

Deno.test('integration: chats - chats - insert message', async () => {
	const token = await getToken();
	//create a user
	const userResponse = await fetch(`${authURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'testuser',
			password: 'Password123',
			email: 'testemail@test.com',
			fname: 'test',
			lname: 'test',
		}),
	});
	const user = await userResponse.json();
	const chatResponse = await fetch(`${moduleURL}/private/chat`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			user: user.data.user_id,
		}),
	});
	const chat = await chatResponse.json();

	const response = await fetch(`${moduleURL}/message`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			chatId: chat.data.chatId,
			content: 'test message',
			contentType: 1,
		}),
	});

	assertEquals(response.status, 201);

	await response.body?.cancel();

	//delete the user
	const tempToken = await getToken({ username: 'testuser', password: 'Password123' });
	const deleteUserResponse = await fetch(`${authURL}/delete-account`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${tempToken}`,
		},
		body: JSON.stringify({
			password: 'Password123',
		}),
	});

	deleteUserResponse.body?.cancel();
});
