# @atcute/client

lightweight and cute API client for AT Protocol.

- **small**, the bare minimum is ~1 kB gzipped with the full package at ~2.4 kB gzipped.
- **no runtime validation**, type definitions match actual HTTP responses, the server is assumed to
  be trusted in returning valid responses.

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

by default, the API client only ships with the base AT Protocol (`com.atproto.*`) lexicons and
endpoints , along with a middleware for doing a (legacy) authentication with a PDS. you can extend
these with optional definition packages:

- [`@atcute/bluemoji`](../../definitions/bluemoji): adds `blue.moji.*` definitions
- [`@atcute/bluesky`](../../definitions/bluesky): adds `app.bsky.*` and `chat.bsky.*` definitions
- [`@atcute/ozone`](../../definitions/ozone): adds `tools.ozone.*` definitions
- [`@atcute/whitewind`](../../definitions/whitewind): adds `com.whtwnd.*` definitions
