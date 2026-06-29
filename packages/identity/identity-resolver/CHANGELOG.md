# @atcute/identity-resolver

## 2.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/lexicons@2.0.2
  - @atcute/util-fetch@2.0.1

## 2.0.0

### Major Changes

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

- Updated dependencies [f45af74]
- Updated dependencies [6aa06fb]
- Updated dependencies [1437627]
- Updated dependencies [8d4aebc]
- Updated dependencies [d64ddf1]
- Updated dependencies [ceea6eb]
  - @atcute/identity@2.0.0
  - @atcute/lexicons@2.0.0
  - @atcute/util-fetch@2.0.0

## 1.2.3

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/lexicons@1.3.1

## 1.2.2

### Patch Changes

- 2f34ad8: shared DoH JSON fetch utilities
- Updated dependencies [2f34ad8]
  - @atcute/util-fetch@1.0.5

## 1.2.1

### Patch Changes

- 10ec011: properly validate Cloudflare DoH responses

## 1.2.0

### Minor Changes

- 9c8a343: introduce ActorResolver interface

## 1.1.4

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2
  - @atcute/util-fetch@1.0.3

## 1.1.3

### Patch Changes

- 876c776: use `manual` redirect instead of `error`

  apparently Cloudflare Workers doesn't think it makes sense for edge runtimes to support it, but
  how exactly? who knows.

  ```
  TypeError: Invalid redirect value, must be one of "follow" or "manual" ("error" won't be implemented since it does not make sense at the edge; use "manual" and check the response status code).
  ```

## 1.1.2

### Patch Changes

- 90f7504: set `cache` to undefined instead of default

  for some reason, Cloudflare Workers complains about this, fine, have it your way.

## 1.1.1

### Patch Changes

- 0b0850c: mark `TMethod` type parameter in DidDocumentResolver as optional
- Updated dependencies [a2dbb16]
- Updated dependencies [9ef363f]
  - @atcute/lexicons@1.0.4

## 1.1.0

### Minor Changes

- 95e4cc1: XRPC-based DID document resolver (`XrpcDidDocumentResolver`)

  worth noting that the reference PDS implementation hasn't implemented
  `com.atproto.identity.resolveDid` yet so this is currently only useful when you have an XRPC
  server implementing this procedure.

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

### Patch Changes

- Updated dependencies [551c67a]
  - @atcute/identity@1.0.0

## 0.1.2

### Patch Changes

- c4d18cc: add a small sanity check on individual document resolvers

## 0.1.1

### Patch Changes

- aa41b72: don't bind fetch to this on XrpcHandleResolver
