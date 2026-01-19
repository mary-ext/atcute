# @atcute/oauth-keyset

keyset management for AT Protocol OAuth.

## installation

```sh
npm install @atcute/oauth-keyset
```

## usage

### generating keys

```ts
import { generatePrivateKey, Keyset } from '@atcute/oauth-keyset';

// generate a new ES256 key
const key = await generatePrivateKey('my-key-id');

// create a keyset with the key
const keyset = new Keyset([key]);
```

### importing keys

```ts
import { importJwkKey, importPkcs8Key, Keyset } from '@atcute/oauth-keyset';

// import from JWK
const jwkKey = await importJwkKey({
	kty: 'EC',
	crv: 'P-256',
	kid: 'my-key',
	// ... private key parameters
});

// import from PKCS#8 PEM
const pemKey = await importPkcs8Key(pemString, {
	kid: 'my-key',
	alg: 'ES256',
});

const keyset = new Keyset([jwkKey, pemKey]);
```

### exporting keys

```ts
import { exportJwkKey, exportPkcs8Key } from '@atcute/oauth-keyset';

// export to JWK
const jwk = await exportJwkKey(key);

// export to PKCS#8 PEM
const pem = await exportPkcs8Key(key);
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

## license

0BSD
