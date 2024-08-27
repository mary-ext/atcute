# @atcute/client

lightweight and cute API client for AT Protocol.

- Small, the bare minimum is ~1 kB gzipped with the full package at ~2.4 kB gzipped.
- No validations, type definitions match actual HTTP responses.

This package only contains the base AT Protocol lexicons and endpoints, along with an authentication middleware.
For Bluesky-related lexicons, see `@atcute/bluesky` package.

```ts
import { XRPC, CredentialManager } from '@atcute/client';

const manager = new CredentialManager({ service: 'https://bsky.social' });
const rpc = new XRPC({ handler: manager });

await manager.login({ identifier: 'example.com', password: 'ofki-yrwl-hmcc-cvau' });

console.log(manager.session);
// -> { refreshJwt: 'eyJhb...', ... }

const { data } = await rpc.get('com.atproto.identity.resolveHandle', {
	params: {
		handle: 'pfrazee.com',
	},
});

console.log(data.did);
// -> did:plc:ragtjsm2j2vknwkz3zp4oxrd
```
