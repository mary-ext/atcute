---
'@atcute/oauth-node-client': major
---

refactor key management to use `@atcute/oauth-crypto`

**renamed exports:**

| before               | after                             |
| -------------------- | --------------------------------- |
| `generatePrivateKey` | `generateClientAssertionKey`      |
| `importJwkKey`       | `importClientAssertionPrivateJwk` |
| `importPkcs8Key`     | `importClientAssertionPkcs8`      |
| `exportJwkKey`       | `exportPrivateJwk`                |
| `exportPkcs8Key`     | `exportPkcs8PrivateKey`           |

**renamed types:**

| before       | after                       |
| ------------ | --------------------------- |
| `PrivateKey` | `ClientAssertionPrivateKey` |

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

// after
import {
	generateClientAssertionKey,
	importClientAssertionPrivateJwk,
	exportPrivateJwk,
	type ClientAssertionPrivateKey,
} from '@atcute/oauth-node-client';

const key = await generateClientAssertionKey('main', 'ES256');
const jwk = await exportPrivateJwk(key);
const imported = await importClientAssertionPrivateJwk(jwk);
```
