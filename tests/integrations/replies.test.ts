import { assertEquals } from '@std/assert/equals';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/replies`
	: 'http://localhost:4000/replies';

const postURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/posts`
	: 'http://localhost:4000/posts';

Deno.test('integration: replies - post:/ - post reply', async () => {
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

	const response = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			postId: data.post.id,
			content: 'Test Reply Content',
		}),
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

Deno.test('integration: replies - delete:/id - delete reply', async () => {
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

	const replyResponse = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			postId: data.post.id,
			content: 'Test Reply Content',
		}),
	});

	const { data: replyData } = await replyResponse.json();

	const response = await fetch(`${moduleURL}/`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			replyId: replyData[0].id,
		}),
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

Deno.test('integration: replies - post:/ - nested reply', async () => {
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

	const response = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			postId: data.post.id,
			content: 'Test Reply Content',
		}),
	});

	const { data: replyData } = await response.json();

	const nestedResponse = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			postId: data.post.id,
			content: 'Test Nested Reply Content',
			parentReplyId: replyData[0].id,
		}),
	});

	assertEquals(nestedResponse.status, 200);

	await nestedResponse.body?.cancel();

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

Deno.test('integration: replies - post:/ - not found post id', async () => {
	const token = await getToken();

	const response = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			postId: '00000000-0000-200a-a000-000000000000',
			content: 'Test Reply Content',
		}),
	});

	assertEquals(response.status, 400);
	await response.body?.cancel();
});
