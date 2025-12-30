# @atcute/atproto

## 3.1.10

### Patch Changes

- 336313e: pull latest Bluesky lexicons

## 3.1.9

### Patch Changes

- 8b5d7e0: pull latest Bluesky lexicons

## 3.1.8

### Patch Changes

- 1429438: add `atcute:lexicons` metadata to package.json

  all lexicon definition packages now include the `atcute:lexicons` field with namespace mappings,
  enabling automatic import resolution when used with `@atcute/lex-cli`'s `imports` configuration.

## 3.1.7

### Patch Changes

- 8f4bd4b: add JSDoc to object fields

## 3.1.6

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2

## 3.1.5

### Patch Changes

- b2e8c17: pull latest Bluesky lexicons

## 3.1.4

### Patch Changes

- 5c34327: pull latest Bluesky lexicons

## 3.1.3

### Patch Changes

- c3e2999: pull latest Bluesky lexicons

## 3.1.2

### Patch Changes

- a53bc05: pull latest Bluesky lexicons
- Updated dependencies [394080c]
  - @atcute/lexicons@1.1.1

## 3.1.1

### Patch Changes

- fa6146b: pull latest Bluesky lexicons

## 3.1.0

### Minor Changes

- e8592d0: bring back convenient interfaces for XRPC operations

  in hindsight, it was a big mistake making substituting `AppBskyFeedGetTimeline.Output` for
  `InferXRPCBodyInput<AppBskyFeedGetTimeline.mainSchema['output']>`!

  the change was prompted because lexicon documents do not reserve names for the code generator's
  types, you could have a document defining a query and a type named `output`, and you'd basically
  wreck havoc on the codegen itself.

  but clearly these convenient interfaces are still worth having, so while it now exists, the
  compromise is that these interfaces now have been renamed to ensure they don't conflict with any
  definitions ever:
  - `Params` to `$params`, for query parameters
  - `Input` to `$input`, for request body
  - `Output` to `$output`, for response body

## 3.0.3

### Patch Changes

- 30ccef3: set a minimum constraint of 1 array items for XRPC parameters
- Updated dependencies [a2dbb16]
- Updated dependencies [9ef363f]
  - @atcute/lexicons@1.0.4

## 3.0.2

### Patch Changes

- e2d3d00: ensure object properties, enums, and other sortable items are sorted
- 1b1bd64: CID-formatted strings should be validated

  somehow missed this

- Updated dependencies [61b0fd1]
  - @atcute/lexicons@1.0.2

## 3.0.1

### Patch Changes

- 480e58b: missing pure annotation on constrained arrays
- 69db9c7: include expected content-type in xrpc operation schema
- Updated dependencies [6abad75]
- Updated dependencies [5310da3]
- Updated dependencies [3125bf6]
- Updated dependencies [5ec9a3c]
- Updated dependencies [69db9c7]
  - @atcute/lexicons@1.0.1
