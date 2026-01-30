---
'@atcute/oauth-browser-client': major
---

internalize implementation details and remove re-exports

**removed exports:**

- `OAuthServerAgent` class (internal)
- `DPoPKey` type → use `DpopPrivateJwk` from `@atcute/oauth-crypto`
- `IdentityResolver`, `ResolvedIdentity`, `ResolveIdentityOptions`, `DefaultIdentityResolverOptions`
  → use `ActorResolver` and related types from `@atcute/identity-resolver`
- `defaultIdentityResolver` (deprecated) → use `LocalActorResolver` from `@atcute/identity-resolver`
- re-exported oauth-types (`OAuthTokenResponse`, `AuthorizationServerMetadata`, `ClientMetadata`,
  `OAuthParResponse`, `ProtectedResourceMetadata`) → import from `@atcute/oauth-types` directly

**changed types:**

- `FetchClientAssertionParams.jkt` removed (now computed internally)

**stored session format:**

internal DPoP key format changed from `DPoPKey` to `DpopPrivateJwk`. existing sessions are
automatically migrated on first access.

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

types re-exported from `@atcute/oauth-types` now have an `OAuth` prefix:

```ts
// before
import type { AuthorizationServerMetadata, ClientMetadata } from '@atcute/oauth-browser-client';

// after
import type { OAuthAuthorizationServerMetadata, OAuthClientMetadata } from '@atcute/oauth-types';
```

custom `ClientAssertionFetcher` implementations should remove `jkt`:

```ts
// before
const fetchAssertion: ClientAssertionFetcher = async ({ jkt, aud, createDpopProof }) => {
	// jkt was passed to your backend
};

// after
const fetchAssertion: ClientAssertionFetcher = async ({ aud, createDpopProof }) => {
	// backend should compute jkt from the DPoP proof instead
};
```
