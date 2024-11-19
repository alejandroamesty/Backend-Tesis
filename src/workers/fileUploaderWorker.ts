import MIME_TYPES from '../types/types.ts';

const STATIC_DIR = './public';

const ensureDirectoryExists = async (dir: string) => {
	try {
		await Deno.mkdir(dir, { recursive: true });
	} catch (error) {
		if (error instanceof Deno.errors.AlreadyExists) {
			throw error;
		}
	}
};

const handler = async (request: Request): Promise<Response> => {
	try {
		await ensureDirectoryExists(STATIC_DIR);

		const formData = await request.formData();
		const file = formData.get('file') as File;
		if (!file) {
			return new Response('No file found in request', { status: 400 });
		}

		// Validate MIME type
		const fileType = file.type; // Get the file's MIME type
		if (!Object.values(MIME_TYPES).includes(fileType)) {
			return new Response('Unsupported file type', { status: 400 });
		}

		// Generate a unique file name with proper extension
		const extension =
			Object.keys(MIME_TYPES).find((key) => MIME_TYPES[key] === fileType) || '';

		const fileName = `${crypto.randomUUID()}${extension}`;

		const filePath = `${STATIC_DIR}/${fileName}`;

		// Save the file
		const arrayBuffer = await file.arrayBuffer();
		const fileBuffer = new Uint8Array(arrayBuffer);
		await Deno.writeFile(filePath, fileBuffer);

		const responseBody = JSON.stringify({ msg: 'File uploaded', fileName: fileName });

		return new Response(responseBody, {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.log(error);
		return new Response('Error uploading file', { status: 500 });
	}
};

Deno.serve({ port: Number(Deno.env.get('FILE_UPLOADER_PORT')) }, handler);
