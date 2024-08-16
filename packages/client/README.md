# @atcute/client

lightweight and cute API client for AT Protocol.

- Small, comes in at ~1,720 b minified (~904 b minzipped).
- No validations, type definitions match actual HTTP responses.

This package only contains the base AT Protocol lexicons and endpoints, along with an authentication middleware.
For Bluesky-related lexicons, see `@atcute/bluesky` package.

```ts
import { XRPC } from '@atcute/client';
import { AtpAuth } from '@atcute/client/middlewares/auth';

const rpc = new XRPC({ service: 'https://bsky.social' });
const auth = new AtpAuth(rpc);

await auth.login({ identifier: 'example.com', password: 'ofki-yrwl-hmcc-cvau' });

console.log(auth.session);
// -> { refreshJwt: 'eyJhb...', ... }

const { data } = await rpc.get('com.atproto.identity.resolveHandle', {
	params: {
		handle: 'pfrazee.com',
	},
});

console.log(data.did);
// -> did:plc:ragtjsm2j2vknwkz3zp4oxrd
```
