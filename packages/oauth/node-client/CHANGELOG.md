# @atcute/oauth-node-client

## 2.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/identity-resolver@2.0.1
  - @atcute/identity@2.0.1
  - @atcute/lexicons@2.0.2
  - @atcute/util-fetch@2.0.1
  - @atcute/client@5.1.1
  - @atcute/oauth-crypto@1.0.1
  - @atcute/oauth-keyset@0.1.2
  - @atcute/oauth-types@1.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [63a1d80]
- Updated dependencies [0fb5499]
- Updated dependencies [f45af74]
- Updated dependencies [6aa06fb]
- Updated dependencies [1437627]
- Updated dependencies [8d4aebc]
- Updated dependencies [d64ddf1]
- Updated dependencies [7d530ad]
- Updated dependencies [ceea6eb]
  - @atcute/client@5.0.0
  - @atcute/identity@2.0.0
  - @atcute/identity-resolver@2.0.0
  - @atcute/lexicons@2.0.0
  - @atcute/oauth-types@1.0.0
  - @atcute/oauth-crypto@1.0.0
  - @atcute/util-fetch@2.0.0
  - @atcute/oauth-keyset@0.1.1

## 1.1.1

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/client@4.2.2
  - @atcute/identity@1.1.5
  - @atcute/identity-resolver@1.2.3
  - @atcute/lexicons@1.3.1

## 1.1.0

### Minor Changes

- 0463193: public client support

### Patch Changes

- Updated dependencies [0463193]
  - @atcute/oauth-types@0.1.1

## 1.0.0

### Major Changes

- aee92d3: refactor key management to use `@atcute/oauth-crypto`

  key generation and PKCS#8 import now return JWKs directly - no separate import step needed. keys
  are imported and cached transparently when first used for signing.

  **renamed exports:**

  | before               | after                        |
  | -------------------- | ---------------------------- |
  | `generatePrivateKey` | `generateClientAssertionKey` |
  | `importPkcs8Key`     | `importClientAssertionPkcs8` |

  **removed exports:**
  - `importJwkKey` - JWKs can now be used directly without importing
  - `exportJwkKey` - `generateClientAssertionKey` already returns a JWK

  **renamed types:**

  | before       | after                       |
  | ------------ | --------------------------- |
  | `PrivateKey` | `ClientAssertionPrivateJwk` |

  **removed types:**
  - `ImportKeyOptions` - key import functions now have a simpler signature
  - `SigningAlgorithm` - import from `@atcute/oauth-crypto` if needed

  **migration:**

  ```ts
  // before
  import {
  	generatePrivateKey,
  	importJwkKey,
  	exportJwkKey,
  	type PrivateKey,
  } from '@atcute/oauth-node-client';

  const key = await generatePrivateKey('main', 'ES256');
  const jwk = await exportJwkKey(key);
  const imported = await importJwkKey(jwk);
  const keyset = new Keyset([imported]);

  // after
  import {
  	generateClientAssertionKey,
  	type ClientAssertionPrivateJwk,
  } from '@atcute/oauth-node-client';

  // generateClientAssertionKey returns a JWK directly
  const jwk = await generateClientAssertionKey('main', 'ES256');
  // JWKs can be used directly - no import step needed
  const keyset = new Keyset([jwk]);

  // loading from environment/storage:
  const storedJwk = JSON.parse(process.env.PRIVATE_KEY_JWK!) as ClientAssertionPrivateJwk;
  const keyset = new Keyset([storedJwk]);
  ```

### Patch Changes

- b113eaf: manual redirect handling for CF workers support
- d7863ad: allow passing multiple prompts as fallback values
- a2e12fc: make use of @atcute/oauth-types and @atcute/oauth-keyset
- Updated dependencies [e73fddf]
  - @atcute/lexicons@1.2.7

## 0.1.3

### Patch Changes

- 5c9f96c: add scope builder for constructing OAuth scopes

  the `scope` namespace provides type-safe helpers for building atproto OAuth scope strings.

  ```ts
  import { OAuthClient, scope } from '@atcute/oauth-node-client';

  const oauth = new OAuthClient({
  	metadata: {
  		// ...
  		scope: [
  			scope.include({
  				nsid: 'app.bsky.authFullApp',
  				aud: 'did:web:api.bsky.app#bsky_appview',
  			}),
  			scope.include({
  				nsid: 'chat.bsky.authFullChatClient',
  				aud: 'did:web:api.bsky.chat#bsky_chat',
  			}),

  			scope.rpc({ lxm: ['com.atproto.moderation.createReport'], aud: '*' }),
  			scope.blob({ accept: ['image/*', 'video/*'] }),
  			scope.account({ attr: 'email', action: 'manage' }),
  			scope.identity({ attr: 'handle' }),
  		],
  	},

  	// ...
  });
  ```

- Updated dependencies [10ec011]
  - @atcute/identity-resolver@1.2.1

## 0.1.2

### Patch Changes

- d206199: remove unnecessary in-memory lock

  SessionGetter has no need to pull in a default lock function for single-process usage,
  CachedGetter already provides guarantee that only one session restoration can happen at a time for
  a given DID.

## 0.1.1

### Patch Changes

- 937b6a3: do not check if jwks_uri is same-origin
