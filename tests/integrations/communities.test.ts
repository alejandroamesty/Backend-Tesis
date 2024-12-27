import { assertEquals } from '@std/assert/equals';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/communities`
	: 'http://localhost:4000/communities';

const authURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/auth`
	: 'http://localhost:4000/auth';

Deno.test('integration: communities - get:/ - get communities', async () => {
	const token = await getToken();
	const response = await fetch(moduleURL, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const _data = await response.json();
	assertEquals(response.status, 200);
});

Deno.test('integration: communities - post:/ - post community', async () => {
	const token = await getToken();
	const response = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Description',
			private_community: true,
		}),
	});
	const _data = await response.json();
	assertEquals(response.status, 201);
	// Delete the community
	const deleteResponse = await fetch(`${moduleURL}/${_data.data[0].id}/`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	await deleteResponse.body?.cancel();
});

Deno.test('integration: communities - post:/ - invalid post community', async () => {
	const token = await getToken();
	const response = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			description: 'Test Description',
		}),
	});
	const _data = await response.json();
	assertEquals(response.status, 400);
});

Deno.test('integration: communities - delete:/:id - delete community', async () => {
	const token = await getToken();
	// Create a community
	const communityResponse = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Description',
			private_community: true,
		}),
	});
	const { data } = await communityResponse.json();
	// Delete the community
	const response = await fetch(`${moduleURL}/${data[0].id}/`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const _data = await response.json();
	assertEquals(response.status, 200);
});

Deno.test('integration: communities - delete:/:id - not found delete community', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000/`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const _data = await response.json();
	assertEquals(response.status, 403);
});

Deno.test('integration: communities - get:/id - get community by id', async () => {
	const token = await getToken();
	// Create a community
	const communityResponse = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Description',
			private_community: true,
		}),
	});
	const { data } = await communityResponse.json();
	// Get the community
	const response = await fetch(`${moduleURL}/${data[0].id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const _data = await response.json();
	assertEquals(response.status, 200);
	// Delete the community
	const deleteResponse = await fetch(`${moduleURL}/${data[0].id}/`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteResponse.body?.cancel();
});

Deno.test('integration: communities - get:/id - not found get community by id', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	const _data = await response.json();
	assertEquals(response.status, 404);
});

Deno.test('integration: communities - put:/id - put community', async () => {
	const token = await getToken();
	// Create a community
	const communityResponse = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Description',
			private_community: true,
		}),
	});
	const { data } = await communityResponse.json();
	// Update the community
	const response = await fetch(`${moduleURL}/${data[0].id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community Updated',
		}),
	});
	await response.body?.cancel();
	assertEquals(response.status, 200);
	// Delete the community
	const deleteResponse = await fetch(`${moduleURL}/${data[0].id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteResponse.body?.cancel();
});

Deno.test('integration: communities - put:/id - not found put community', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community Updated',
		}),
	});
	const _data = await response.json();
	assertEquals(response.status, 403);
});

Deno.test('integration: communities - post:/:id/add - post member', async () => {
	const token = await getToken();
	// create community -> create user -> add user to community -> assert -> delete user -> delete community
	// Create a community
	const communityResponse = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Description',
			private_community: true,
		}),
	});
	const { data } = await communityResponse.json();
	// Create a user
	const userResponse = await fetch(`${authURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			username: 'testuser',
			email: 'testuseremail@test.com',
			password: 'Test1234',
			fname: 'Test',
			lname: 'User',
		}),
	});
	const { data: { user_id } } = await userResponse.json();
	// Add user to community
	const response = await fetch(`${moduleURL}/${data[0].id}/add`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			user_id,
		}),
	});
	const _data = await response.json();
	assertEquals(response.status, 201);

	// Delete the user
	const tempToken = await getToken({ username: 'testuser', password: 'Test1234' });
	const deleteResponse = await fetch(`${authURL}/delete-account`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${tempToken}`,
		},
		body: JSON.stringify({
			password: 'Test1234',
		}),
	});
	await deleteResponse.body?.cancel();

	// Delete the community
	const deleteCommunityResponse = await fetch(`${moduleURL}/${data[0].id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	await deleteCommunityResponse.body?.cancel();
});

Deno.test('integration: communities - post:/:id/add - not found post member', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000/add`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			user_id: '00000000-0000-200a-a000-000000000000',
		}),
	});
	const _data = await response.json();
	assertEquals(response.status, 403);
});

Deno.test('integration: communities - post:/:id/remove - delete member', async () => {
	const token = await getToken();
	// create community -> create user -> add user to community -> delete user from community -> assert -> delete user -> delete community
	// Create a community
	const communityResponse = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: 'Test Community',
			description: 'Test Description',
			private_community: true,
		}),
	});
	const { data } = await communityResponse.json();
	// Create a user
	const userResponse = await fetch(`${authURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			username: 'testuser',
			email: 'testemail@email.com',
			password: 'Test1234',
			fname: 'Test',
			lname: 'User',
		}),
	});
	const { data: { user_id } } = await userResponse.json();
	// Add user to community
	const addResponse = await fetch(`${moduleURL}/${data[0].id}/add`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			user_id,
		}),
	});
	await addResponse.json();
	// Delete user from community
	const response = await fetch(`${moduleURL}/${data[0].id}/remove`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			user_id,
		}),
	});
	const _data = await response.json();
	assertEquals(response.status, 200);

	// Delete the user
	const tempToken = await getToken({ username: 'testuser', password: 'Test1234' });
	const deleteResponse = await fetch(`${authURL}/delete-account`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${tempToken}`,
		},
		body: JSON.stringify({
			password: 'Test1234',
		}),
	});
	await deleteResponse.body?.cancel();

	// Delete the community
	const deleteCommunityResponse = await fetch(`${moduleURL}/${data[0].id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});
	await deleteCommunityResponse.body?.cancel();
});

Deno.test('integration: communities - post:/:id/remove - not found delete member', async () => {
	const token = await getToken();
	const response = await fetch(`${moduleURL}/00000000-0000-200a-a000-000000000000/remove`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			user_id: '00000000-0000-200a-a000-000000000000',
		}),
	});
	const _data = await response.json();
	assertEquals(response.status, 403);
});
