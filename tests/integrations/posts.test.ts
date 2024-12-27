import { assertEquals } from '@std/assert';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/posts`
	: 'http://localhost:4000/posts';

Deno.test('integration: posts - posts - get posts', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 200);
	const _data = await response.body?.cancel();
});

Deno.test('integration: posts - posts - post post', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			caption: 'Some Title',
			content: 'Some Content',
		}),
	});
	assertEquals(response.status, 200);
	//delete post
	const { data } = await response.json();
	const deleteResponse = await fetch(`${moduleURL}/${data}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	await deleteResponse.body?.cancel();
});

Deno.test('integration: posts - posts - invalid post post', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			caption: 'Some Title', // Missing content
		}),
	});
	assertEquals(response.status, 400);
	const _data = await response.body?.cancel();
});

Deno.test('integration: posts - posts - get post', async () => {
	const token = await getToken();
	const postResponse = await fetch(`${moduleURL}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			caption: 'Some Title',
			content: 'Some Content',
		}),
	});
	const { data } = await postResponse.json();
	const response = await fetch(`${moduleURL}/${data.post.id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 200);
	const _data = await response.body?.cancel();

	//delete post
	const deleteResponse = await fetch(`${moduleURL}/${data.post.id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	await deleteResponse.body?.cancel();
});

Deno.test('integration: posts - posts - invalid get post', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/invalid-id`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 400);
	const _data = await response.body?.cancel();
});

Deno.test('integration: posts - posts - not found get post', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000`, { // Invalid UUIDj
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 404);
	const _data = await response.body?.cancel();
});

Deno.test('integration: posts - posts - delete post', async () => {
	const token = await getToken();
	const postResponse = await fetch(`${moduleURL}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			caption: 'Some Title',
			content: 'Some Content',
		}),
	});
	const { data } = await postResponse.json();
	const response = await fetch(`${moduleURL}/${data.post.id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 200);
	const _data = await response.body?.cancel();
});

Deno.test('integration: posts - posts - invalid delete post', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/invalid-id`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 400);
	const _data = await response.body?.cancel();
});

Deno.test('integration: posts - posts - not found delete post', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000`, { // Invalid UUID
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	assertEquals(response.status, 404);
	const _data = await response.body?.cancel();
});
