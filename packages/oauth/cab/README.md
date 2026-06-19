# @atcute/oauth-cab

a client assertion backend (CAB) for AT Protocol OAuth.

```sh
npm install @atcute/oauth-cab
```

AT Protocol OAuth makes browser apps choose between a _public_ client (simple, but short session
lifetimes) and a _confidential_ one (longer sessions, but it has to hold a private key). a CAB lets
a single-page app be confidential without standing up a token-mediating proxy: the browser asks this
small endpoint for a client assertion, and tokens never flow through it.

the browser sends a DPoP proof; the CAB verifies it and mints a short-lived, DPoP-bound
`client_assertion` JWT ([RFC 7523][rfc7523]) signed with the client's private key and bound to the
DPoP key via a `cnf.jkt` claim. that binding gives the backend veto power over token issuance — it
can refuse a device, or rotate the advertised keys to revoke sessions en masse — while staying off
the token path. see Bluesky OAuth [proposal 0010][proposal] for the full design.

> [!NOTE]  
> this is the server half of the handshake that `@atcute/oauth-browser-client`'s
> `fetchClientAssertion` performs. the JSON contract between them is yours to define — the client
> only needs the assertion back; everything else is up to your handler.

[proposal]: https://github.com/bluesky-social/proposals/tree/main/0010-client-assertion-backend
[rfc7523]: https://datatracker.ietf.org/doc/html/rfc7523

## usage

### setting up the backend

create a backend with your client id, the endpoint's public URL, and a signing keyset:

```ts
import { ClientAssertionBackend, generateClientAssertionKey, Keyset } from '@atcute/oauth-cab';

const keyset = new Keyset([await generateClientAssertionKey('key-1')]);

const backend = new ClientAssertionBackend({
	clientId: 'https://my.client.com/oauth-client-metadata.json',
	endpoint: 'https://my.client.com/oauth/client-assertion',
	keyset,
});
```

advertise the same public keys in your client metadata document, so the authorization server can
verify the assertions you mint:

```ts
const metadata = { /* ... */ jwks: keyset.publicJwks };
```

### handling a request

a request goes through two steps: `verify()` checks the inbound DPoP proof, and `issue()` mints the
assertion. between them is your own code — audience and attestation checks, abuse heuristics, rate
limits — and you map each outcome onto an HTTP response yourself.

this example uses Hono, but any web framework works:

```ts
import { Hono } from 'hono';

import { ClientAssertionBackend, isValidAud } from '@atcute/oauth-cab';

const app = new Hono();

app.post('/oauth/client-assertion', async (c) => {
	const { aud } = await c.req.json<{ aud: string }>();
	if (!isValidAud(aud)) {
		return c.json({ error: 'invalid_request' }, 400);
	}

	const result = await backend.verify({ dpopProof: c.req.header('dpop') });
	if (!result.ok) {
		switch (result.reason) {
			case 'expired':
			case 'invalid':
			case 'missing': {
				return c.json({ error: 'invalid_dpop_proof' }, 400);
			}
			case 'nonce_required': {
				c.header('dpop-nonce', result.nonce);
				return c.json({ error: 'use_dpop_nonce' }, 401);
			}
		}
	}

	// your authorization checks against `result.verified` go here — e.g. device
	// attestation, abuse heuristics, per-device rate limits

	const assertion = await backend.issue(result.verified, { aud });

	c.header('cache-control', 'no-store');
	return c.json({
		client_assertion: assertion.clientAssertion,
		client_assertion_type: assertion.clientAssertionType,
	});
});
```

`issue()` mints assertions with a fixed 60-second lifetime, reported as `expiresIn`. the JSON body
above is just one shape — return whatever your client's `fetchClientAssertion` expects.

### nonces

pass a nonce provider to require a DPoP nonce. until the client presents a fresh one, `verify()`
returns `nonce_required` and your handler challenges with `401` + `DPoP-Nonce` (as above); the
client retries with the nonce embedded in its next proof.

```ts
import { MemoryDpopNonceProvider } from '@atcute/oauth-cab';

const backend = new ClientAssertionBackend({
	// ...
	nonces: new MemoryDpopNonceProvider(),
});
```

`MemoryDpopNonceProvider` issues single-use nonces bound to the DPoP key thumbprint, but holds them
in a local map — behind a load balancer, supply a shared-storage `DpopNonceProvider` instead. to
gate issuance on device attestation, bind the attestation payload to the nonce (plus `jkt`, `htu`,
`aud`, and client id) and verify it before calling `issue()`.

## caveats

- CORS is not handled by this package — configure it in your framework. the browser request is a
  cross-origin `POST` with a custom `DPoP` header, so your CORS middleware must allow the client
  origin and the `DPoP` request header. note that CORS is not authentication.
- no authorization server enforces the `cnf.jkt` binding yet. clients using a CAB are public clients
  today, so deploying one now is not a regression — but until an AS enforces the binding, a minted
  assertion is not yet the security upgrade it will become. protect the endpoint (authorization,
  rate limiting, origin checks) in the meantime.
