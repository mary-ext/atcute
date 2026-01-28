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

### importing keys

```ts
import { importClientAssertionPrivateJwk, importClientAssertionPkcs8 } from '@atcute/oauth-crypto';
import { Keyset } from '@atcute/oauth-keyset';

// import from JWK
const jwkKey = await importClientAssertionPrivateJwk({
	kty: 'EC',
	crv: 'P-256',
	kid: 'my-key',
	// ... private key parameters
});

// import from PKCS#8 PEM
const pemKey = await importClientAssertionPkcs8(pemString, {
	kid: 'my-key',
	alg: 'ES256',
});

const keyset = new Keyset([jwkKey, pemKey]);
```

### exporting keys

```ts
import { exportPrivateJwk, exportPkcs8PrivateKey } from '@atcute/oauth-crypto';

// export to JWK
const jwk = await exportPrivateJwk(key);

// export to PKCS#8 PEM
const pem = await exportPkcs8PrivateKey(key);
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
