# @atcute/lexicon-community

## 2.0.4

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/atproto@4.0.3
  - @atcute/lexicons@2.0.2

## 2.0.3

### Patch Changes

- 918827e: pull latest Lexicon Community lexicons

## 2.0.2

### Patch Changes

- a836d6a: declare `sideEffects: false` so bundlers can tree-shake unused schema modules pulled in
  through the barrel
- Updated dependencies [a836d6a]
  - @atcute/atproto@4.0.2

## 2.0.1

### Patch Changes

- 058ab3e: pull latest Lexicon Community lexicons

## 2.0.0

### Patch Changes

- Updated dependencies [d64ddf1]
  - @atcute/lexicons@2.0.0
  - @atcute/atproto@4.0.0

## 1.1.6

### Patch Changes

- 08f7140: pull latest Lexicon Community lexicons

## 1.1.5

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/atproto@3.1.12
  - @atcute/lexicons@1.3.1

## 1.1.4

### Patch Changes

- 1429438: add `atcute:lexicons` metadata to package.json

  all lexicon definition packages now include the `atcute:lexicons` field with namespace mappings,
  enabling automatic import resolution when used with `@atcute/lex-cli`'s `imports` configuration.

- Updated dependencies [1429438]
  - @atcute/atproto@3.1.8

## 1.1.3

### Patch Changes

- aa0f257: pull latest Lexicon Community lexicons

## 1.1.2

### Patch Changes

- 8f4bd4b: add JSDoc to object fields
- Updated dependencies [8f4bd4b]
  - @atcute/atproto@3.1.7

## 1.1.1

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2
  - @atcute/atproto@3.1.6

## 1.1.0

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

### Patch Changes

- Updated dependencies [e8592d0]
  - @atcute/atproto@3.1.0

## 1.0.1

### Patch Changes

- e2d3d00: ensure object properties, enums, and other sortable items are sorted
- Updated dependencies [e2d3d00]
- Updated dependencies [1b1bd64]
- Updated dependencies [61b0fd1]
  - @atcute/atproto@3.0.2
  - @atcute/lexicons@1.0.2
