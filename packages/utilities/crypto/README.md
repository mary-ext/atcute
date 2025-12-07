# @atcute/crypto

cryptographic utilities for AT Protocol.

```sh
npm install @atcute/crypto
```

this package provides key generation, signing, and verification for the two elliptic curve systems
used by AT Protocol to certify identity and repository data:

- `p256`: uses WebCrypto API
- `secp256k1`: uses `node:crypto` on Node.js, [`@noble/secp256k1`][noble-secp256k1] elsewhere

[noble-secp256k1]: https://github.com/paulmillr/noble-secp256k1

## usage

### creating keypairs

```ts
import { Secp256k1PrivateKeyExportable, P256PrivateKeyExportable } from '@atcute/crypto';

// secp256k1 keypair
const keypair = await Secp256k1PrivateKeyExportable.createKeypair();

// p256 keypair
const p256Keypair = await P256PrivateKeyExportable.createKeypair();
```

### signing data

```ts
// sign() hashes the data and signs it
const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
const sig = await keypair.sign(data);
```

### exporting public keys

```ts
// export as did:key format
const didKey = await keypair.exportPublicKey('did');
// -> "did:key:zQ3shVRtgqTRHC7Lj4DYScoDgReNpsDp3HBnuKBKt1FSXKQ38"

// export as multibase
const multibase = await keypair.exportPublicKey('multibase');
```

### verifying signatures

```ts
import { verifySigWithDidKey } from '@atcute/crypto';

// verify using did:key (automatically detects curve type)
const ok = await verifySigWithDidKey(didKey, sig, data);
```
