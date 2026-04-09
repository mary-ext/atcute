# @atcute/frontpage

## 2.0.2

### Patch Changes

- 43b2d76: regenerate with blob constraints
- Updated dependencies [94065a1]
  - @atcute/lexicons@1.3.0

## 2.0.1

### Patch Changes

- 82761df: pull latest Frontpage lexicons
- Updated dependencies [4b99ff8]
- Updated dependencies [2022754]
  - @atcute/atproto@3.1.11
  - @atcute/lexicons@1.2.10

## 2.0.0

### Major Changes

- 4ade55d: pull latest Frontpage lexicons

  normally this would've been a patch change, but this change alters Frontpage's types are exported
  to accomodate for the new `fyi.frontpage.*` namespace.

  another major change may occur if the old namespace is fully removed.

### Patch Changes

- Updated dependencies [03a13b3]
  - @atcute/lexicons@1.2.5

## 1.0.5

### Patch Changes

- 1429438: add `atcute:lexicons` metadata to package.json

  all lexicon definition packages now include the `atcute:lexicons` field with namespace mappings,
  enabling automatic import resolution when used with `@atcute/lex-cli`'s `imports` configuration.

- Updated dependencies [1429438]
  - @atcute/atproto@3.1.8

## 1.0.4

### Patch Changes

- 8f4bd4b: add JSDoc to object fields
- Updated dependencies [8f4bd4b]
  - @atcute/atproto@3.1.7

## 1.0.3

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2
  - @atcute/atproto@3.1.6

## 1.0.2

### Patch Changes

- Updated dependencies [e2d3d00]
- Updated dependencies [1b1bd64]
- Updated dependencies [61b0fd1]
  - @atcute/atproto@3.0.2
  - @atcute/lexicons@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [6abad75]
- Updated dependencies [5310da3]
- Updated dependencies [3125bf6]
- Updated dependencies [480e58b]
- Updated dependencies [5ec9a3c]
- Updated dependencies [69db9c7]
  - @atcute/lexicons@1.0.1
  - @atcute/atproto@3.0.1
