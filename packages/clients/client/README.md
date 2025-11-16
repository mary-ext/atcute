# @atcute/client

lightweight and cute API client for AT Protocol.

- **small**, the bare minimum is ~1 kB gzipped with the full package at ~2.4 kB gzipped.
- **no runtime validation**, type definitions match actual HTTP responses, the server is assumed to
  be trusted in returning valid responses.

```ts
import { Client, CredentialManager, ok, simpleFetchHandler } from '@atcute/client';

// import lexicons
import type {} from '@atcute/bluesky';

// basic usage
{
	const handler = simpleFetchHandler({ service: 'https://public.api.bsky.app' });
	const rpc = new Client({ handler });

	// explicit response handling
	{
		const { ok, data } = await rpc.get('app.bsky.actor.getProfile', {
			params: {
				actor: 'bsky.app',
			},
		});

		if (!ok) {
			switch (data.error) {
				case 'InvalidRequest': {
					// Account doesn't exist
					break;
				}
				case 'AccountTakedown': {
					// Account taken down
					break;
				}
				case 'AccountDeactivated': {
					// Account deactivated
					break;
				}
			}
		}

		if (ok) {
			console.log(data.displayName);
			// -> "Bluesky"
		}
	}

	// optimistic response handling
	{
		const data = await ok(
			rpc.get('app.bsky.actor.getProfile', {
				params: {
					actor: 'bsky.app',
				},
			}),
		);

		console.log(data.displayName);
		// -> "Bluesky"
	}
}

// performing authenticated requests
{
	const manager = new CredentialManager({ service: 'https://bsky.social' });
	const rpc = new Client({ handler: manager });

	await manager.login({ identifier: 'example.com', password: 'ofki-yrwl-hmcc-cvau' });

	console.log(manager.session);
	// -> { refreshJwt: 'eyJhb...', ... }

	const data = await ok(
		rpc.get('com.atproto.identity.resolveHandle', {
			params: {
				handle: 'pfrazee.com',
			},
		}),
	);

	console.log(data.did);
	// -> 'did:plc:ragtjsm2j2vknwkz3zp4oxrd'
}
```

by default, the API client ships with no queries or procedures. you can extend the client by
installing one of these definition packages.

- [`@atcute/atproto`](../../definitions/atproto): `com.atproto.*` schema definitions
- [`@atcute/bluemoji`](../../definitions/bluemoji): `blue.moji.*` schema definitions
- [`@atcute/bluesky`](../../definitions/bluesky): `app.bsky.*` and `chat.bsky.*` schema definitions
- [`@atcute/frontpage`](../../definitions/frontpage): `fyi.unravel.frontpage.*` schema definitions
- [`@atcute/lexicon-community`](../../definitions/lexicon-community): `community.lexicon.\*`
  schema definitions
- [`@atcute/ozone`](../../definitions/ozone): `tools.ozone.*` schema definitions
- [`@atcute/tangled`](../../definitions/tangled): `sh.tangled.*` schema definitions
- [`@atcute/whitewind`](../../definitions/whitewind): `com.whtwnd.*` schema definitions
