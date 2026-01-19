# @atcute/oauth-cab

Client Assertion Backend (CAB) for AT Protocol OAuth browser clients.

```sh
npm install @atcute/oauth-cab
```

CAB enables browser-based OAuth clients to become confidential clients by having a backend service
that issues DPoP-bound client assertions.

## usage

### server-side (CAB backend)

> **note:** the CAB endpoint should only accept requests from your client's origin(s) to prevent
> other websites from abusing it. serving the endpoint from the same origin as your web application
> is the simplest way to enforce this.

#### with XRPC router

```ts
import {
	buildClientMetadata,
	generatePrivateKey,
	Keyset,
	registerCab,
} from '@atcute/oauth-cab/server';
import { XRPCRouter, cors } from '@atcute/xrpc-server';

const keyset = new Keyset([await generatePrivateKey('my-key')]);

const metadata = buildClientMetadata(
	{
		client_id: 'https://example.com/oauth-client-metadata.json',
		redirect_uris: ['https://example.com/oauth/callback'],
		scope: 'atproto transition:generic',
		client_name: 'my app',
		jwks_uri: 'https://example.com/jwks.json',
	},
	keyset,
);

const router = new XRPCRouter({
	// if using CORS middleware, exclude CAB endpoint (it should be same-origin)
	middlewares: [cors({ exclude: ['dev.atcute.oauth.getClientAssertion'] })],
});

await registerCab(router, {
	client_id: metadata.client_id,
	keyset,
	// dpopSecret: false,
	// dpopSecret: 'hex-secret'
});

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/oauth-client-metadata.json') {
			return Response.json(metadata);
		}
		if (url.pathname === '/jwks.json') {
			return Response.json(keyset.publicJwks);
		}

		return router.fetch(request);
	},
};
```

#### standalone handler

```ts
import {
	buildClientMetadata,
	createCabHandler,
	generatePrivateKey,
	Keyset,
} from '@atcute/oauth-cab/server';

// create keyset
const keyset = new Keyset([await generatePrivateKey('my-key')]);

// build client metadata
const metadata = buildClientMetadata(
	{
		client_id: 'https://example.com/oauth-client-metadata.json',
		redirect_uris: ['https://example.com/oauth/callback'],
		scope: 'atproto transition:generic',
		client_name: 'my app',
		jwks_uri: 'https://example.com/jwks.json',
	},
	keyset,
);

// create handler (returns undefined for non-matching paths)
const handler = await createCabHandler({
	client_id: metadata.client_id,
	keyset,
	// dpopSecret: false,
	// dpopSecret: 'hex-secret',
});

// use with Hono
app.get('/oauth-client-metadata.json', (c) => c.json(metadata));
app.get('/jwks.json', (c) => c.json(keyset.publicJwks));
app.all('*', async (c, next) => {
	const res = await handler(c.req.raw);
	if (res === undefined) {
		return next();
	}
	return res;
});
```

### client-side (browser)

```ts
import { createCabFetcher } from '@atcute/oauth-cab/client';
import { configureOAuth } from '@atcute/oauth-browser-client';

configureOAuth({
	// ... other options
	fetchClientAssertion: createCabFetcher(), // defaults to location.origin
});
```
