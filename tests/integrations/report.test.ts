import { assertEquals } from '@std/assert/equals';
import getToken from '../getToken.ts';

const moduleURL = Deno.env.get('BASE_URL')
	? `${Deno.env.get('BASE_URL')}/reports`
	: 'http://localhost:4000/reports';

Deno.test('integration: reports - post:/ - post report', async () => {
	const token = await getToken();

	// create a post
	const reportResponse = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			caption: 'Test Report Title',
			content: 'Test Report Content',
			coordinates: {
				x: 1,
				y: 1,
			},
		}),
	});

	const { data } = await reportResponse.json();
	assertEquals(reportResponse.status, 200);

	// delete report
	const deleteResponse = await fetch(`${moduleURL}/${data.post.post_id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	await deleteResponse.body?.cancel();
});

Deno.test('integration: reports - delete:/:id - delete report', async () => {
	const token = await getToken();

	// create a post
	const reportResponse = await fetch(moduleURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			caption: 'Test Report Title',
			content: 'Test Report Content',
			coordinates: {
				x: 1,
				y: 1,
			},
		}),
	});

	const { data } = await reportResponse.json();

	// delete report
	const deleteResponse = await fetch(`${moduleURL}/${data.post.post_id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
	});

	assertEquals(deleteResponse.status, 200);
	await deleteResponse.body?.cancel();
});
