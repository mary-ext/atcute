# @atcute/oauth-keyset

keyset management for AT Protocol OAuth.

```sh
npm install @atcute/oauth-keyset
```

## usage

### generating keys

```ts
import { generateClientAssertionKey } from '@atcute/oauth-crypto';
import { Keyset } from '@atcute/oauth-keyset';

// generate a new ES256 key
const key = await generateClientAssertionKey('my-key-id');

// create a keyset with the key
const keyset = new Keyset([key]);
```

### using JWKs directly

```ts
import type { ClientAssertionPrivateJwk } from '@atcute/oauth-crypto';
import { Keyset } from '@atcute/oauth-keyset';

// JWKs can be used directly - no import step needed
const jwk: ClientAssertionPrivateJwk = {
	kty: 'EC',
	crv: 'P-256',
	kid: 'my-key',
	alg: 'ES256',
	// ... private key parameters (x, y, d)
};

const keyset = new Keyset([jwk]);
```

### importing from PKCS#8

```ts
import { importClientAssertionPkcs8 } from '@atcute/oauth-crypto';
import { Keyset } from '@atcute/oauth-keyset';

// import from PKCS#8 PEM - returns a JWK
const jwk = await importClientAssertionPkcs8(pemString, {
	kid: 'my-key',
	alg: 'ES256',
});

const keyset = new Keyset([jwk]);
```

### using the keyset

```ts
// get public JWKS (for serving at jwks_uri)
const jwks = keyset.publicJwks;

// find a key by criteria
const key = keyset.find({ kid: 'my-key' });
const key = keyset.find({ alg: 'ES256' });

// find a key for signing with server negotiation
const { key, alg } = keyset.findForSigning(['ES256', 'ES384']);
```
