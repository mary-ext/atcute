---
'@atcute/oauth-browser-client': major
---

handle and DID document resolution are now externalized.

although we've provided a "guide" on how to do your own handle resolution, the client itself still
had to make its own resolution for post-authorization verification checks. this change finally makes
it possible for you to supply a resolver for the client to use, and you're required to provide them.

after upgrading, you would supply `handleResolver` and `didDocumentResolver` to `configureOAuth`.
using `@atcute/identity-resolver` is recommended for this.

```ts
import { configureOAuth } from '@atcute/oauth-browser-client';

import {
	CompositeDidDocumentResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	XrpcHandleResolver,
} from '@atcute/identity-resolver';

configureOAuth({
	// ... existing config

	// AT Protocol handles resolve via DNS TXT record or HTTP well-known endpoints.
	// since web apps lack direct DNS access and face CORS restrictions, we're using
	// Bluesky's AppView for this example.
	//
	// NOTE: Bluesky may log handle resolutions and requester info per their privacy
	// policy. consider the privacy implications of this arrangement and change this
	// setup if unsuitable for your use case.
	handleResolver: new XrpcHandleResolver({ serviceUrl: 'https://public.api.bsky.app' }),

	didDocumentResolver: new CompositeDidDocumentResolver({
		methods: {
			plc: new PlcDidDocumentResolver(),
			web: new WebDidDocumentResolver(),
		},
	}),
});
```

`resolveFromIdentity` and `resolveFromService` has been removed as a result. instead, pass the
target directly to `createAuthorizationUrl`.

```ts
const authUrl = await createAuthorizationUrl({
	target: { type: 'account', identifier: 'mary.my.id' },
	//   or { type: 'pds', serviceUrl: 'https://bsky.social' }

	// ... existing options
});
```
