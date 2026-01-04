import type { FetchMiddleware } from '../main/router.js';

export interface CORSOptions {
	/** Additional headers to expose to the client */
	exposedHeaders?: string[];
	/** Additional headers to allow */
	allowedHeaders?: string[];
	/** NSID prefixes to exclude from CORS handling */
	exclude?: string[];
	/** allow requests from private networks (e.g., localhost to a local server) */
	allowPrivateNetwork?: boolean;
}

const DEFAULT_EXPOSED_HEADERS = [
	'dpop-nonce',
	'www-authenticate',

	'ratelimit-limit',
	'ratelimit-policy',
	'ratelimit-remaining',
	'ratelimit-reset',
];

const DEFAULT_ALLOWED_HEADERS = [
	'content-type',

	'authorization',
	'dpop',

	'atproto-accept-labelers',
	'atproto-proxy',
];

const RE_XRPC_NSID = /^\/xrpc\/([^?]*)/;

export const cors = (options: CORSOptions = {}): FetchMiddleware => {
	const exposedHeaders = Array.from(
		new Set([...DEFAULT_EXPOSED_HEADERS, ...(options.exposedHeaders?.map((h) => h.toLowerCase()) || [])]),
	).sort();

	const allowedHeaders = Array.from(
		new Set([...DEFAULT_ALLOWED_HEADERS, ...(options.allowedHeaders?.map((h) => h.toLowerCase()) || [])]),
	)
		.sort()
		.join(',');

	const exclude = options.exclude;
	const allowPrivateNetwork = options.allowPrivateNetwork;

	return async (request, next) => {
		// check if this NSID should be excluded from CORS handling
		if (exclude) {
			const url = new URL(request.url);
			const match = RE_XRPC_NSID.exec(url.pathname);

			if (match) {
				const nsid = match[1];
				const excluded = exclude.some((pattern) => {
					if (pattern.endsWith('.*')) {
						return nsid.startsWith(pattern.slice(0, -1));
					}
					return nsid === pattern;
				});

				if (excluded) {
					return next(request);
				}
			}
		}

		const origin = request.headers.get('origin') || '*';

		// Handle preflight requests
		if (request.method === 'OPTIONS') {
			const headers = new Headers();
			headers.set('access-control-max-age', '86400');
			headers.set('access-control-allow-origin', origin);

			if (allowedHeaders) {
				headers.set('access-control-allow-headers', allowedHeaders);
			}

			if (allowPrivateNetwork && request.headers.get('access-control-request-private-network') === 'true') {
				headers.set('access-control-allow-private-network', 'true');
			}

			return new Response(null, { status: 204, headers: headers });
		}

		const response = await next(request);

		const expose = exposedHeaders.filter((h) => response.headers.has(h)).join(',');

		response.headers.set('access-control-allow-origin', origin);
		if (expose.length > 0) {
			response.headers.append('access-control-expose-headers', expose);
		}

		return response;
	};
};
