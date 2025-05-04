# @atcute/cid

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
