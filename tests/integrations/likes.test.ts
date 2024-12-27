import { assertEquals } from '@std/assert/equals';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/likes`
	: 'http://localhost:4000/likes';

const postURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/posts`
	: 'http://localhost:4000/posts';

Deno.test('integration: likes - get:/id - get post likes', async () => {
	const token = await getToken();
	// create a post
	const postResponse = await fetch(postURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			caption: 'Test Post Title',
			content: 'Test Post Content',
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
	await response.body?.cancel();
	// delete post
	const deleteResponse = await fetch(`${postURL}/${data.post.id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteResponse.body?.cancel();
});

Deno.test('integration: likes - post:/id - like post', async () => {
	const token = await getToken();

	// create a post
	const postResponse = await fetch(postURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			caption: 'Test Post Title',
			content: 'Test Post Content',
		}),
	});

	const { data: postData } = await postResponse.json();

	const response = await fetch(`${moduleURL}/like`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			post_id: postData.post.id,
		}),
	});

	assertEquals(response.status, 200);
	await response.body?.cancel();

	// delete post
	const deleteResponse = await fetch(`${postURL}/${postData.post.id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteResponse.body?.cancel();
});

Deno.test('integration: likes - delete:/id - unlike post', async () => {
	const token = await getToken();

	// create a post as the user
	const postResponse = await fetch(postURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			caption: 'Test Post Title',
			content: 'Test Post Content',
		}),
	});

	const { data: postData } = await postResponse.json();

	// like post
	const likeResponse = await fetch(`${moduleURL}/like`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			post_id: postData.post.id,
		}),
	});

	likeResponse.body?.cancel();

	const response = await fetch(`${moduleURL}/unlike`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			post_id: postData.post.id,
		}),
	});

	assertEquals(response.status, 200);
	await response.body?.cancel();

	// delete post
	const deleteResponse = await fetch(`${postURL}/${postData.post.id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteResponse.body?.cancel();
});

Deno.test('integration: likes - post:/id - like post - invalid post id', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/like`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			post_id: 0,
		}),
	});

	assertEquals(response.status, 400);
	await response.body?.cancel();
});

Deno.test('integration: likes - delete:/id - unlike post - invalid post id', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/unlike`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			post_id: 0,
		}),
	});

	assertEquals(response.status, 400);
	await response.body?.cancel();
});

Deno.test('integration: likes - post:/id - like post - post not found', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/like`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			post_id: '00000000-0000-200a-a000-000000000000',
		}),
	});

	assertEquals(response.status, 400);
	await response.body?.cancel();
});
