# @atcute/identity-resolver

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
