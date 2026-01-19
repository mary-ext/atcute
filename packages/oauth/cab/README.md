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

#### standalone handler

```ts
import { createCabHandler, Keyset, generatePrivateKey } from '@atcute/oauth-cab/server';

// create keyset
const keyset = new Keyset([await generatePrivateKey('my-key')]);

// create handler (returns undefined for non-matching paths)
const handler = await createCabHandler({
	clientId: 'https://example.com/client-metadata.json',
	keyset,
	// dpopSecret: false,        // disable DPoP nonce requirement
	// dpopSecret: 'hex-secret', // shared secret for multi-instance deployments
});

// use with Hono
app.all('*', async (c, next) => {
	const res = await handler(c.req.raw);
	if (res === undefined) {
		return next();
	}
	return res;
});
```

#### with XRPC router

```ts
import { registerCab, Keyset, generatePrivateKey } from '@atcute/oauth-cab/server';
import { XRPCRouter, cors } from '@atcute/xrpc-server';

const keyset = new Keyset([await generatePrivateKey('my-key')]);

const router = new XRPCRouter({
	// if using CORS middleware, exclude CAB endpoint (it should be same-origin)
	middlewares: [cors({ exclude: ['dev.atcute.oauth.getClientAssertion'] })],
});

await registerCab(router, {
	clientId: 'https://example.com/client-metadata.json',
	keyset,
});

export default router;
```

### client-side (browser)

```ts
import { createCABFetcher } from '@atcute/oauth-cab/client';
import { configureOAuth } from '@atcute/oauth-browser-client';

configureOAuth({
	// ... other options
	fetchClientAssertion: createCABFetcher(), // defaults to location.origin
});
```
