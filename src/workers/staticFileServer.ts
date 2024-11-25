import { extname, fromFileUrl } from 'https://deno.land/std/path/mod.ts';
import MIME_TYPES from '../types/types.ts';
const STATIC_DIR = '../../public';

const handler = async (request: Request): Promise<Response> => {
	const url = new URL(request.url);
	const filePath = fromFileUrl(new URL(STATIC_DIR + url.pathname, import.meta.url));

	try {
		const fileInfo = await Deno.stat(filePath);
		if (fileInfo.isFile) {
			const file = await Deno.readFile(filePath);
			const contentType = MIME_TYPES[extname(filePath)];
			if (!contentType) {
				console.log('404: Not Found');
				return new Response('404: Not Found', { status: 404 });
			}
			return new Response(file, { headers: { 'Content-Type': contentType } });
		}
		console.log('404: Not Found');
		return new Response('404: Not Found', { status: 404 });
	} catch (error) {
		console.log(error);
		return new Response('404: Not Found', { status: 404 });
	}
};

Deno.serve({
	port: Number(Deno.env.get('STATIC_SERVER_PORT')),
	onListen() {
		console.log(
			`Static file server running on http://localhost:${Deno.env.get('STATIC_SERVER_PORT')}/`,
		);
	},
}, handler);
