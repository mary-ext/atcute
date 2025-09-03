# @atcute/crypto

## 2.2.4

### Patch Changes

- 559ce56: fix typing issue around Uint8Array in the p256 keypair
- 6ab1823: `P256PublicKey.importRaw(publicKey)` no longer throws cryptic errors when importing
  compressed P256 keys on Firefox and Safari.

  note that `P256PrivateKey.importRaw(privateKey)` will still throw cryptic errors on Firefox, this
  is not something that can be remedied on this side. either wait for Firefox 143 stable release or
  manually pass a public key as the second argument.

- Updated dependencies [a0471dd]
- Updated dependencies [5241c38]
  - @atcute/multibase@1.1.5
  - @atcute/uint8array@1.0.4

## 2.2.3

### Patch Changes

- 6673400: include `type` and `jwtAlg` as part of PublicKey interface
- Updated dependencies [0e6e5eb]
  - @atcute/uint8array@1.0.3
  - @atcute/multibase@1.1.5

## 2.2.2

### Patch Changes

- Updated dependencies [ede65cf]
  - @atcute/uint8array@1.0.2
  - @atcute/multibase@1.1.4

## 2.2.1

### Patch Changes

- Updated dependencies [5aedfc5]
  - @atcute/multibase@1.1.3
