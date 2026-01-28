---
'@atcute/oauth-browser-client': major
---

clean up exports and internalize implementation details

**removed exports (never intended as public API):**

- `OAuthServerAgent` class - internal implementation detail
- `DPoPKey` type - replaced by `DpopPrivateJwk` from `@atcute/oauth-crypto`
- `IdentityResolver`, `ResolvedIdentity`, `ResolveIdentityOptions`, `DefaultIdentityResolverOptions`
  type aliases - use `@atcute/identity-resolver` directly
- `defaultIdentityResolver` function - was deprecated, use `LocalActorResolver` from
  `@atcute/identity-resolver`
- re-exported types from `@atcute/oauth-types` (`OAuthTokenResponse`, `AuthorizationServerMetadata`,
  `ClientMetadata`, `OAuthParResponse`, `ProtectedResourceMetadata`) - import directly from
  `@atcute/oauth-types`

**changed types:**

- `FetchClientAssertionParams.jkt` removed - the JWK thumbprint is now computed internally when
  needed

**stored session format:**

the internal DPoP key format changed from a custom `DPoPKey` object to the standard `DpopPrivateJwk`
format. existing sessions are automatically migrated on first access, no action required.

**migration:**

```ts
// before
import {
	type DPoPKey,
	type IdentityResolver,
	defaultIdentityResolver,
} from '@atcute/oauth-browser-client';

// after
import type { DpopPrivateJwk } from '@atcute/oauth-crypto';
import { LocalActorResolver, type ActorResolver } from '@atcute/identity-resolver';
```

if you were using the re-exported types from `@atcute/oauth-types`:

```ts
// before
import type { AuthorizationServerMetadata, ClientMetadata } from '@atcute/oauth-browser-client';

// after
import type { OAuthAuthorizationServerMetadata, OAuthClientMetadata } from '@atcute/oauth-types';
```

if you implemented a custom `ClientAssertionFetcher`, remove the `jkt` parameter:

```ts
// before
const fetchAssertion: ClientAssertionFetcher = async ({ jkt, aud, createDpopProof }) => {
	// jkt was passed to your backend
};

// after
const fetchAssertion: ClientAssertionFetcher = async ({ aud, createDpopProof }) => {
	// jkt is now computed by the backend from the DPoP proof
};
```
