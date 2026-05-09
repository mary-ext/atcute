# @atcute/did-plc

## 1.0.0

### Major Changes

- 8fca39d: migrate from `@badrap/valita` to `valibot`

  exported schemas are now valibot schemas.

  ```ts
  import * as v from 'valibot';
  import { operation } from '@atcute/did-plc';

  // before
  const result = operation.try(input);

  // after
  const result = v.safeParse(operation, input);
  ```

### Patch Changes

- Updated dependencies [f45af74]
- Updated dependencies [6aa06fb]
- Updated dependencies [1437627]
- Updated dependencies [8d4aebc]
- Updated dependencies [d64ddf1]
- Updated dependencies [ceea6eb]
  - @atcute/identity@2.0.0
  - @atcute/lexicons@2.0.0
  - @atcute/util-fetch@2.0.0

## 0.3.3

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/cbor@2.3.3
  - @atcute/identity@1.1.5
  - @atcute/lexicons@1.3.1

## 0.3.2

### Patch Changes

- da379ce: optimize did:plc identifier creation
- Updated dependencies [a891529]
- Updated dependencies [b9e9152]
- Updated dependencies [95dfb99]
- Updated dependencies [6e63aab]
- Updated dependencies [fe963f8]
- Updated dependencies [441b28a]
- Updated dependencies [b3d0852]
- Updated dependencies [ffc3f54]
- Updated dependencies [0c56e4b]
  - @atcute/cbor@2.3.2
  - @atcute/multibase@1.1.8
  - @atcute/lexicons@1.2.9
  - @atcute/uint8array@1.1.1
  - @atcute/cid@2.4.1

## 0.3.1

### Patch Changes

- cc1f10d: add proper error handling and tests

## 0.3.0

### Minor Changes

- b01eb65: add `signOperation` and `signTombstone` functions for signing unsigned PLC operations
- b01eb65: add `PlcClient` for interacting with plc.directory API

  includes new types `PlcState` and `SequencedEntry` for API responses

- b01eb65: add `deriveDidFromGenesisOp` to derive did:plc identifier from genesis operation

### Patch Changes

- Updated dependencies [f737494]
  - @atcute/lexicons@1.2.6

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
