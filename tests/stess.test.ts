import { assertEquals } from '@std/assert';

async function sendBatchedRequests(
	url: string,
	options: object,
	totalRequests: number,
	batchSize: number,
) {
	const totalBatches = Math.ceil(totalRequests / batchSize);
	const startTime = performance.now();

	console.log(`Starting operation with ${totalRequests} requests in ${totalBatches} batches`);

	for (let batch = 0; batch < totalBatches; batch++) {
		console.log(`Starting batch ${batch + 1} of ${totalBatches}`);
		const requests = [];

		// Prepare the requests for the current batch
		for (let i = 0; i < batchSize && batch * batchSize + i < totalRequests; i++) {
			requests.push(fetch(url, options));
		}

		// Execute the batch of requests
		const responses = await Promise.all(requests);

		// Handle the responses
		for (const [_index, response] of responses.entries()) {
			assertEquals(response.ok, true); // Check if each response is successful
			await response.json(); // Consume the response body
		}
	}
	const endTime = performance.now();
	console.log(`Operation completed in ${endTime - startTime}ms`);
}

// Test function
Deno.test('Stress', async () => {
	const totalRequests = 1000; // Total number of requests
	const batchSize = 100; // Number of requests per batch
	const url = Deno.env.get('BASE_URL') + '/users';
	const options = {
		method: 'GET',
	};

	await sendBatchedRequests(url, options, totalRequests, batchSize);
});
