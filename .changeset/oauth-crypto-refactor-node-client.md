---
'@atcute/oauth-node-client': major
---

refactor key management to use `@atcute/oauth-crypto`

key generation and PKCS#8 import now return JWKs directly - no separate import step needed. keys are
imported and cached transparently when first used for signing.

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
