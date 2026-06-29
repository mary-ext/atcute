# @atcute/multibase

## 1.2.4

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/uint8array@1.1.3

## 1.2.3

### Patch Changes

- b868dba: drop the native base58 module in favor of the JS implementation

## 1.2.2

### Patch Changes

- 5afc172: reject non-ascii characters when decoding base32
- ac4d22b: faster base58 decoding
- ebcc548: faster base58 encoding
- 4842999: faster base64 and base16 decoding
- 40082d8: fix undefined behaviour and invalid pointer dereferences in native code

## 1.2.1

### Patch Changes

- 6165047: silence Rollup `/*#__PURE__*/` warnings

## 1.2.0

### Minor Changes

- 76aa79d: native base58 encode/decode

## 1.1.8

### Patch Changes

- b9e9152: alternative base32 encoding implementation
- b3d0852: faster base32 and base58 encoding/decoding
- 0c56e4b: faster base64 padding trim
- Updated dependencies [fe963f8]
- Updated dependencies [441b28a]
  - @atcute/uint8array@1.1.1

## 1.1.7

### Patch Changes

- f859da9: add `workerd` condition for Cloudflare Workers support
- Updated dependencies [a60d862]
- Updated dependencies [2772033]
  - @atcute/uint8array@1.1.0

## 1.1.6

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [b30da0e]
  - @atcute/uint8array@1.0.5

## 1.1.5

### Patch Changes

- a0471dd: fix typing issue around Uint8Array
- Updated dependencies [5241c38]
  - @atcute/uint8array@1.0.4

## 1.1.4

### Patch Changes

- Updated dependencies [ede65cf]
  - @atcute/uint8array@1.0.2

## 1.1.3

### Patch Changes

- 5aedfc5: consistent behavior in multibase encode
