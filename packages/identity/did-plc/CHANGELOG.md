# @atcute/did-plc

## 0.2.0

### Minor Changes

- d12bcb6: loosen validations around PLC operations

  the schemas still contain constraints that are considered a hard requirement, but the soft
  requirements goes to `validateIncomingOp()`, use this if you're trying to check whether the
  operation you're trying to submit would pass or not.

## 0.1.7

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [4393144]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2
  - @atcute/cbor@2.2.6
  - @atcute/uint8array@1.0.5
  - @atcute/multibase@1.1.6
  - @atcute/identity@1.1.1
  - @atcute/crypto@2.2.5
  - @atcute/cid@2.2.4

## 0.1.6

### Patch Changes

- 1bdc0bd: add new limits for verificationMethods
- 1f7e06e: allow did:key using other key types for verificationMethods
- Updated dependencies [2fe5658]
- Updated dependencies [c1582e0]
  - @atcute/identity@1.0.3

## 0.1.5

### Patch Changes

- Updated dependencies [ede65cf]
  - @atcute/uint8array@1.0.2
  - @atcute/cbor@2.2.4
  - @atcute/cid@2.2.3
  - @atcute/crypto@2.2.2
  - @atcute/multibase@1.1.4

## 0.1.4

### Patch Changes

- Updated dependencies [e55a918]
- Updated dependencies [b6ea3f3]
  - @atcute/cid@2.2.2
  - @atcute/cbor@2.2.3

## 0.1.3

### Patch Changes

- Updated dependencies [9ea1e46]
- Updated dependencies [fce1e2c]
- Updated dependencies [745e12b]
  - @atcute/cbor@2.2.2

## 0.1.2

### Patch Changes

- Updated dependencies [5aedfc5]
- Updated dependencies [3972bbf]
  - @atcute/multibase@1.1.3
  - @atcute/cbor@2.2.1
  - @atcute/cid@2.2.1
  - @atcute/crypto@2.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [4e678dd]
- Updated dependencies [e56e6df]
- Updated dependencies [fdfd8a8]
- Updated dependencies [73a8c32]
- Updated dependencies [e446f57]
- Updated dependencies [c30d2eb]
  - @atcute/cid@2.2.0
  - @atcute/cbor@2.2.0
