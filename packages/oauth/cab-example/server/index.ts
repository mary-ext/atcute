import { env } from 'cloudflare:workers';

import { buildClientMetadata, createCabHandler, importJwkKey, Keyset, scope } from '@atcute/oauth-cab/server';

const keyset = new Keyset([await importJwkKey(env.PRIVATE_KEY_JWK)]);

const metadata = buildClientMetadata(
	{
		client_id: new URL('/oauth-client-metadata.json', env.PUBLIC_URL).href,
		redirect_uris: [new URL('/oauth/callback', env.PUBLIC_URL).href],
		scope: [scope.repo({ collection: ['app.bsky.feed.post'] })],
		client_name: 'atcute oauth cab example',
		client_uri: env.PUBLIC_URL,
		jwks_uri: new URL('/jwks.json', env.PUBLIC_URL).href,
	},
	keyset,
);

const cabHandler = await createCabHandler({
	client_id: metadata.client_id!,
	keyset,
});

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/oauth-client-metadata.json') {
			return Response.json(metadata, {
				headers: { 'cache-control': 'public, max-age=3600' },
			});
		}

		if (url.pathname === '/jwks.json') {
			return Response.json(keyset.publicJwks, {
				headers: { 'cache-control': 'public, max-age=3600' },
			});
		}

		const response = cabHandler(request);
		if (response !== undefined) {
			return response;
		}

		return new Response(null, { status: 404 });
	},
} satisfies ExportedHandler<Env>;
