import { fromFileUrl, extname } from 'https://deno.land/std/path/mod.ts';

const STATIC_DIR = '../../public';
const MIME_TYPES: Record<string, string> = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain',
};

const handler = async (request: Request): Promise<Response> => {
	const url = new URL(request.url);
	const filePath = fromFileUrl(new URL(STATIC_DIR + url.pathname, import.meta.url));

	try {
		const fileInfo = await Deno.stat(filePath);
		if (fileInfo.isFile) {
			const file = await Deno.readFile(filePath);
			const contentType = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
			return new Response(file, { headers: { 'Content-Type': contentType } });
		}
		console.log('404: Not Found');
		return new Response('404: Not Found', { status: 404 });
	} catch (error) {
		console.log(error);
		return new Response('404: Not Found', { status: 404 });
	}
};

Deno.serve({ port: Number(Deno.env.get('STATIC_SERVER_PORT')) }, handler);

console.log(
	`Static file server running on http://localhost:${Deno.env.get('STATIC_SERVER_PORT')}/`
);
