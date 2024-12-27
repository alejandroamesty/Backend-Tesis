import { assertEquals } from '@std/assert/equals';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/events`
	: 'http://localhost:4000/events';

const communityURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/communities`
	: 'http://localhost:4000/communities';

Deno.test('integration: events - get:/ - get all events', async () => {
	const token = await getToken();
	const response = await fetch(moduleURL, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});
	const _data = await response.json();
	assertEquals(response.status, 200);
});

Deno.test('integration: events - get:/:id - get all events from community', async () => {
	const token = await getToken();
	//create a community
	const communityResponse = await fetch(communityURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Community Description',
			private_community: true,
		}),
	});
	const { data } = await communityResponse.json();
	const communityId = data[0].id;

	const response = await fetch(`${moduleURL}/${communityId}`, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});
	const _data = await response.json();
	assertEquals(response.status, 200);

	// Delete the community
	const deleteResponse = await fetch(`${communityURL}/${communityId}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteResponse.body?.cancel();
});

Deno.test('integration: events - post:/:id - create event', async () => {
	const token = await getToken();

	// Create a community
	const communityResponse = await fetch(communityURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Community Description',
			private_community: true,
		}),
	});
	const { data: newData } = await communityResponse.json();

	const response = await fetch(`${moduleURL}/${newData[0].id}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Event',
			description: 'Test Event Description',
			event_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
			event_location: { x: 10.1234, y: -64.5678 },
		}),
	});
	const { data } = await response.json();
	assertEquals(response.status, 200);

	// Cancel the event
	const deleteResponse = await fetch(`${moduleURL}/${data.id}/remove`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});
	await deleteResponse.body?.cancel();

	// Delete the community
	const deleteCommunityResponse = await fetch(`${communityURL}/${newData[0].id}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteCommunityResponse.body?.cancel();
});

Deno.test('integration: events - delete:/id - cancel event', async () => {
	const token = await getToken();
	//create a community
	const communityResponse = await fetch(communityURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Community Description',
			private_community: true,
		}),
	});
	const { data: newData } = await communityResponse.json();
	const communityId = newData[0].id;

	// Create an event
	const eventResponse = await fetch(`${moduleURL}/${communityId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Event',
			description: 'Test Event Description',
			event_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
			event_location: { x: 10.1234, y: -64.5678 },
		}),
	});
	const { data } = await eventResponse.json();

	// Cancel the event
	const response = await fetch(`${moduleURL}/${data.id}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});
	const _data = await response.json();
	assertEquals(response.status, 200);

	// Delete the community
	const deleteCommunityResponse = await fetch(`${communityURL}/${communityId}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteCommunityResponse.body?.cancel();
});

Deno.test('integration: events - put:/id - update event', async () => {
	const token = await getToken();

	//create a community

	const communityResponse = await fetch(communityURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Community Description',
			private_community: true,
		}),
	});
	const { data: newData } = await communityResponse.json();
	const chatId = newData[0].id;

	// Create an event
	const eventResponse = await fetch(`${moduleURL}/${chatId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Event',
			description: 'Test Event Description',
			event_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
			event_location: { x: 10.1234, y: -64.5678 },
		}),
	});
	const { data } = await eventResponse.json();

	// Update the event
	const response = await fetch(`${moduleURL}/${data.id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Updated Event Name',
		}),
	});
	await response.body?.cancel();
	assertEquals(response.status, 200);

	// Cancel the event
	const deleteResponse = await fetch(`${moduleURL}/${data.id}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});
	await deleteResponse.body?.cancel();

	// Delete the community
	const deleteCommunityResponse = await fetch(`${communityURL}/${chatId}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteCommunityResponse.body?.cancel();
});

Deno.test('integration: events - delete:/id - not found cancel event', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});
	const _data = await response.json();
	assertEquals(response.status, 403);
});

Deno.test('integration: events - put:/id - not found update event', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Updated Event Name',
		}),
	});
	const _data = await response.json();
	assertEquals(response.status, 403);
});
