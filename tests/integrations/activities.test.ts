import { assertEquals } from '@std/assert';
import getToken from '../getToken.ts';
const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/activities`
	: 'http://localhost:4000/activities';

Deno.test('integration: activities - get all activities', async () => {
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

Deno.test('integration: activities - post activity', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			activity_description: 'Some Activity',
		}),
	});
	assertEquals(response.status, 201);
	await response.body?.cancel();
});

Deno.test('integration: activities - invalid post activity', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			activity_description: 123,
		}),
	});
	assertEquals(response.status, 400);
	await response.body?.cancel();
});

Deno.test('integration: activities - not found update activity', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			completed: true,
		}),
	});
	assertEquals(response.status, 404);
	await response.body?.cancel();
});

Deno.test('integration: activities - invalid update activity', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			completed: 'true',
		}),
	});
	assertEquals(response.status, 400);
	await response.body?.cancel();
});

Deno.test('integration: activities - update activity', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const activities = await response.json();
	const activity_id = activities.data[0].activity_id;
	const response2 = await fetch(`${moduleURL}/${activity_id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			completed: true,
		}),
	});
	assertEquals(response2.status, 200);
	await response2.body?.cancel();
});
