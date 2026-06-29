# @atcute/cid

## 2.4.2

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/multibase@1.2.4
  - @atcute/uint8array@1.1.3

## 2.4.1

### Patch Changes

- ffc3f54: remove toString caching

  they weren't really useful as `toString()` are one-off calls usually

- Updated dependencies [b9e9152]
- Updated dependencies [fe963f8]
- Updated dependencies [441b28a]
- Updated dependencies [b3d0852]
- Updated dependencies [0c56e4b]
  - @atcute/multibase@1.1.8
  - @atcute/uint8array@1.1.1

## 2.4.0

### Minor Changes

- 0795806: update to DASL spec 2025-10-20
  - remove support for empty CIDs (zero-length digests), which were removed from the spec
  - reject `Infinity` values in CBOR encoder (in addition to `NaN`)
  - optimize streamed CAR reader by removing buffer concatenation for CID reads

## 2.3.0

### Minor Changes

- 8f59979: fromDigest function

## 2.2.6

### Patch Changes

- b76bc11: use WeakMap for CID string caching

## 2.2.5

### Patch Changes

- 4653fe5: memoize toString results
- bd7df47: `equals` function for CID comparison

## 2.2.4

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [b30da0e]
  - @atcute/uint8array@1.0.5
  - @atcute/multibase@1.1.6

## 2.2.3

### Patch Changes

- Updated dependencies [ede65cf]
  - @atcute/uint8array@1.0.2
  - @atcute/multibase@1.1.4

## 2.2.2

### Patch Changes

- e55a918: internal identity symbol

## 2.2.1

### Patch Changes

- Updated dependencies [5aedfc5]
  - @atcute/multibase@1.1.3

## 2.2.0

### Minor Changes

- e446f57: allow creation of empty CIDs
- c30d2eb: expose CidLink interface as a separate exports

### Patch Changes

- 4e678dd: perform length check on CIDs

  a DASL CIDv1, assuming properly created, will always be 36 bytes long.

- e56e6df: `create` should return digest via subarray

  before, the Cid interface would have two separate array buffers backing it

- fdfd8a8: skip using varint for CID codec

  we are dealing with DASL CIDv1, and we only support SHA-256. the length of a CID is guaranteed to
  be 36 bytes, with 4 bytes for header and 32 bytes for digest contents.
