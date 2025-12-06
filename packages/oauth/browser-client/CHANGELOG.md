# @atcute/oauth-browser-client

## 2.0.2

### Patch Changes

- 18afebb: replace IdentityResolver with ActorResolver

  not marking the functions as deprecated yet, I think those can come later.

- Updated dependencies [a562b63]
- Updated dependencies [9c8a343]
- Updated dependencies [1b2c79f]
  - @atcute/uint8array@1.0.6
  - @atcute/identity-resolver@1.2.0

## 2.0.1

### Patch Changes

- 7d3da57: request client assertion during PAR request

## 2.0.0

### Major Changes

- bac1b0f: allow passing user-provided state during authorization

  `createAuthorizationUrl` now takes in an optional `state` property

  ```ts
  const authUrl = await createAuthorizationUrl({
  	// ...
  	state: {
  		// ...
  	},
  });
  ```

  `finalizeAuthorization` now returns an object containing `session` and your provided `state`.

  ```ts
  const { session, state } = await finalizeAuthorization(params);
  ```

- bac1b0f: handle and DID document resolution are now externalized.

  although we've provided a "guide" on how to do your own handle resolution, the client itself still
  had to make its own resolution for post-authorization verification checks. this change finally
  makes it possible for you to supply a resolver for the client to use, and you're required to
  provide them.

  after upgrading, you would supply an `identityResolver` to `configureOAuth`. there is a built-in
  identity resolver implementation that takes in a handle and DID document resolver (which you can
  use `@atcute/identity-resolver` with.)

  ```ts
  import { configureOAuth, defaultIdentityResolver } from '@atcute/oauth-browser-client';

  import {
  	CompositeDidDocumentResolver,
  	PlcDidDocumentResolver,
  	WebDidDocumentResolver,
  	XrpcHandleResolver,
  } from '@atcute/identity-resolver';

  configureOAuth({
  	// ... existing config

  	identityResolver: defaultIdentityResolver({
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

### Minor Changes

- bac1b0f: allow customizing some parts of the authorization process

  `createAuthorizationUrl` now takes in optional `prompt`, `display`, `locale` fields.

  ```ts
  const authUrl = createAuthorizationUrl({
  	// ...
  	display: 'popup',
  });
  ```

- 80b400e: add support for client assertions.

  this adds an optional `fetchClientAssertion` callback to `configureOAuth` that lets you fetch
  client assertions from your backend, allowing your client to be classified as a confidential
  client.

  ```ts
  import { configureOAuth } from '@atcute/oauth-browser-client';

  configureOAuth({
  	// ... existing config

  	async fetchClientAssertion({ jkt, aud, createDpopProof }) {
  		const dpop = await createDpopProof('https://example.com/api/client-assertion');

  		const response = await fetch('https://example.com/api/client-assertion', {
  			method: 'POST',
  			headers: {
  				dpop: dpop,
  				'content-type': 'application/json',
  			},
  			body: JSON.stringify({ jkt, aud }),
  		});

  		const data = await response.json();

  		return {
  			client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
  			client_assertion: data.assertion,
  		};
  	},
  });
  ```

## 1.0.27

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2
  - @atcute/uint8array@1.0.5
  - @atcute/multibase@1.1.6
  - @atcute/identity@1.1.1
  - @atcute/client@4.0.4

## 1.0.26

### Patch Changes

- 691f5cc: remove `iss` field from dpop jwt tokens
- 1fd2796: remove redundant check before request instantiation
- 9870d55: check if retried request returns a new nonce

  in case the authorization server is set up to always return a new nonce every request.

- Updated dependencies [2fe5658]
- Updated dependencies [c1582e0]
  - @atcute/identity@1.0.3
  - @atcute/client@4.0.4

## 1.0.25

### Patch Changes

- 6dcb891: increase random string length for PKCE challenge

## 1.0.24

### Patch Changes

- 83c069d: use nanoid again for random string generation
- Updated dependencies [0e6e5eb]
- Updated dependencies [a2dbb16]
- Updated dependencies [9ef363f]
  - @atcute/uint8array@1.0.3
  - @atcute/lexicons@1.0.4
  - @atcute/multibase@1.1.5
  - @atcute/client@4.0.4
  - @atcute/identity@1.0.3

## 1.0.23

### Patch Changes

- Updated dependencies [bd446e4]
  - @atcute/client@4.0.3

## 1.0.22

### Patch Changes

- a3f9e9b: only include URL origin and pathname in `htu` when signing DPoP requests

## 1.0.21

### Patch Changes

- Updated dependencies [61b0fd1]
  - @atcute/lexicons@1.0.2
  - @atcute/client@4.0.2
  - @atcute/identity@1.0.2

## 1.0.20

### Patch Changes

- Updated dependencies [ede65cf]
- Updated dependencies [6abad75]
- Updated dependencies [5310da3]
- Updated dependencies [3125bf6]
- Updated dependencies [5ec9a3c]
- Updated dependencies [69db9c7]
  - @atcute/uint8array@1.0.2
  - @atcute/lexicons@1.0.1
  - @atcute/multibase@1.1.4
  - @atcute/client@4.0.1
  - @atcute/identity@1.0.1

## 1.0.19

### Patch Changes

- Updated dependencies [551c67a]
- Updated dependencies [d02554d]
- Updated dependencies [d02554d]
  - @atcute/identity@1.0.0
  - @atcute/client@4.0.0

## 1.0.18

### Patch Changes

- Updated dependencies [49028fb]
  - @atcute/client@3.1.0

## 1.0.17

### Patch Changes

- Updated dependencies [9d05dfd]
- Updated dependencies [13f35e4]
- Updated dependencies [5aedfc5]
- Updated dependencies [a47373f]
- Updated dependencies [45cc699]
- Updated dependencies [2d10bd8]
- Updated dependencies [8aedcc5]
- Updated dependencies [45cfe46]
- Updated dependencies [813679f]
- Updated dependencies [24be9be]
- Updated dependencies [d3fbc7e]
- Updated dependencies [c7e8573]
- Updated dependencies [61bd8d2]
- Updated dependencies [87a99f1]
  - @atcute/client@3.0.0
  - @atcute/multibase@1.1.3

## 1.0.16

### Patch Changes

- e6d7ec5: use browser-native base64 serialization when possible

## 1.0.15

### Patch Changes

- a71c388: always return stale values from getWithLapsed

## 1.0.14

### Patch Changes

- 3cbf73e: store updatedAt value for DPoP nonces

  we were checking against expiresAt, which was incorrect, the optimization check that'd defer
  requests never actually went through.
