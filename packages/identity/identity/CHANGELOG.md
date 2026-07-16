# @atcute/identity

## 2.0.2

### Patch Changes

- 8482323: fix `normalizeWebDid` corrupting did:web path segments that contain a percent-encoded
  colon.
- 7bcf27c: fix verification material lookup ignoring relative fragment ids, so did documents with
  `#atproto`-style verification method ids resolve their signing keys.
- Updated dependencies [9882a31]
- Updated dependencies [cb01440]
- Updated dependencies [96c679b]
- Updated dependencies [f31de6d]
- Updated dependencies [0e039ef]
  - @atcute/lexicons@2.0.3

## 2.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/lexicons@2.0.2

## 2.0.0

### Major Changes

- f45af74: drop the deprecated `PLC_DID_RE` export

  use `isPlcDid` instead.

  ```ts
  // before
  PLC_DID_RE.test(input);

  // after
  isPlcDid(input);
  ```

- 6aa06fb: drop the deprecated `FRAGMENT_RE` and `MULTIBASE_RE` exports.
- 1437627: drop the deprecated `WEB_DID_RE` and `ATPROTO_WEB_DID_RE` exports

  use `isWebDid` / `isAtprotoWebDid` instead.

  ```ts
  // before
  WEB_DID_RE.test(input);
  ATPROTO_WEB_DID_RE.test(input);

  // after
  isWebDid(input);
  isAtprotoWebDid(input);
  ```

- 8d4aebc: migrate from `@badrap/valita` to `valibot`

  exported schemas are now valibot schemas.

  ```ts
  import * as v from 'valibot';
  import { defs } from '@atcute/identity';

  // before
  const result = defs.didDocument.try(input);

  // after
  const result = v.safeParse(defs.didDocument, input);
  ```

### Patch Changes

- Updated dependencies [d64ddf1]
  - @atcute/lexicons@2.0.0

## 1.1.5

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/lexicons@1.3.1

## 1.1.4

### Patch Changes

- dd9b89a: mark `@context` as optional

## 1.1.3

### Patch Changes

- 4b4a027: fix isAtprotoAudience doing recursive call

## 1.1.2

### Patch Changes

- 5de2d26: add function for checking if input is atproto audience
- Updated dependencies [2e2159b]
  - @atcute/lexicons@1.2.3

## 1.1.1

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2

## 1.1.0

### Minor Changes

- b2dbfc0: add getAtprotoHandle utility function

## 1.0.3

### Patch Changes

- 2fe5658: introduce `isKeyDid` for checking did:key identifiers
- c1582e0: mark the regex exports as deprecated

## 1.0.2

### Patch Changes

- Updated dependencies [61b0fd1]
  - @atcute/lexicons@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [6abad75]
- Updated dependencies [5310da3]
- Updated dependencies [3125bf6]
- Updated dependencies [5ec9a3c]
- Updated dependencies [69db9c7]
  - @atcute/lexicons@1.0.1

## 1.0.0

### Major Changes

- 551c67a: `Did`, `AtprotoDid` and `Handle` types have been removed

  they're now handled by `@atcute/lexicons` package

## 0.1.3

### Patch Changes

- 199ecf0: stop normalizing service array

## 0.1.2

### Patch Changes

- 37e3e11: fallback if URL.parse is not available

## 0.1.1

### Patch Changes

- c0a528b: functions for generic verification material retrieval
- 749f41b: incorrect duplicate check for verification methods
