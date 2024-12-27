import { extname, fromFileUrl } from 'https://deno.land/std/path/mod.ts';
import MIME_TYPES from '../types/types.ts';

const STATIC_DIR = '../../public';

const allowedOrigins = [
	'http://localhost',
	'http://localhost:8100',
	'http://localhost:8101',
	'capacitor://localhost',
];

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
	// Maneja las solicitudes OPTIONS para cumplir con los requisitos de CORS
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: corsHeaders(origin),
		});
	}

	const url = new URL(request.url);
	const filePath = fromFileUrl(new URL(STATIC_DIR + url.pathname, import.meta.url));

	try {
		const fileInfo = await Deno.stat(filePath);
		if (fileInfo.isFile) {
			const file = await Deno.readFile(filePath);
			const contentType = MIME_TYPES[extname(filePath)];
			if (!contentType) {
				console.log('404: Not Found');
				return new Response('404: Not Found', {
					status: 404,
					headers: corsHeaders(origin),
				});
			}
			return new Response(file, {
				headers: {
					'Content-Type': contentType,
					...corsHeaders, // Añade los encabezados CORS
				},
			});
		}
		console.log('404: Not Found');
		return new Response('404: Not Found', {
			status: 404,
			headers: corsHeaders(origin), // Añade los encabezados CORS
		});
	} catch (error) {
		console.log(error);
		return new Response('404: Not Found', {
			status: 404,
			headers: corsHeaders(origin), // Añade los encabezados CORS
		});
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
