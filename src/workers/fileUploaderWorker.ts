import MIME_TYPES from '../types/types.ts';

const STATIC_DIR = './public';

// List of allowed origins
const allowedOrigins = [
	'http://localhost',
	'http://localhost:8100',
	'http://localhost:8101',
	'capacitor://localhost',
];

const ensureDirectoryExists = async (dir: string) => {
	try {
		await Deno.mkdir(dir, { recursive: true });
	} catch (error) {
		if (error instanceof Deno.errors.AlreadyExists) {
			throw error;
		}
	}
};

// CORS headers
const corsHeaders = (origin: string): Record<string, string> => {
	// Return default CORS headers if the origin is allowed, else return empty headers
	if (allowedOrigins.includes(origin)) {
		return {
			'Access-Control-Allow-Origin': origin, // Set allowed origin dynamically
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};
	} else {
		// Return an empty object if the origin is not allowed
		return {};
	}
};

const handler = async (request: Request): Promise<Response> => {
	const origin = request.headers.get('Origin') || ''; // Get the origin from the request

	// Handle OPTIONS request for pre-flight CORS request
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: corsHeaders(origin), // Set CORS headers dynamically based on the origin
		});
	}

	try {
		await ensureDirectoryExists(STATIC_DIR);

		const formData = await request.formData();
		const files = formData.getAll('file') as File[];
		const newFiles: string[] = [];
		const errors: unknown[] = [];

		if (!files.length) {
			return new Response('No files found in request', {
				status: 400,
				headers: corsHeaders(origin), // Set CORS headers dynamically
			});
		}

		for (const file of files) {
			try {
				// Validate MIME type
				const fileType = file.type; // Get the file's MIME type
				if (!Object.values(MIME_TYPES).includes(fileType)) {
					return new Response('Unsupported file type', {
						status: 400,
						headers: corsHeaders(origin), // Set CORS headers dynamically
					});
				}

				// Generate a unique file name with the proper extension
				const extension = Object.keys(MIME_TYPES).find((key) =>
					MIME_TYPES[key] === fileType
				) || '';

				const fileName = `${crypto.randomUUID()}${extension}`;

				const filePath = `${STATIC_DIR}/${fileName}`;

				// Save the file
				const arrayBuffer = await file.arrayBuffer();
				const fileBuffer = new Uint8Array(arrayBuffer);
				await Deno.writeFile(filePath, fileBuffer);
				newFiles.push(fileName);
			} catch (error: unknown) {
				errors.push(error);
			}
		}

		const responseBody = JSON.stringify({ msg: 'File uploaded', fileNames: newFiles });

		return new Response(responseBody, {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders(origin), // Set CORS headers dynamically
			},
		});
	} catch (error) {
		console.log(error);
		return new Response('Error uploading file', {
			status: 500,
			headers: corsHeaders(origin), // Set CORS headers dynamically
		});
	}
};

Deno.serve(
	{
		port: Number(Deno.env.get('FILE_UPLOADER_PORT')),
		onListen() {
			console.log(
				`Upload file server running on http://localhost:${
					Deno.env.get('FILE_UPLOADER_PORT')
				}/`,
			);
		},
	},
	handler,
);
