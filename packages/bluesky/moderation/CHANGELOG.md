# @atcute/bluesky-moderation

## 4.0.0

### Patch Changes

- Updated dependencies [d64ddf1]
  - @atcute/lexicons@2.0.0
  - @atcute/atproto@4.0.0
  - @atcute/bluesky@4.0.0

## 3.0.1

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/lexicons@1.3.1

## 3.0.0

### Major Changes

- 4729dea: replace enums with plain objects

  exported enums are now `as const` objects with companion type aliases. enum member values are
  unchanged, so runtime behavior is identical. the main type-level difference is that string enums
  are no longer nominal — raw string literals are now assignable where enum types were previously
  required.

## 2.0.4

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2

## 2.0.3

### Patch Changes

- c80127b: replace const enums with regular enums

## 2.0.2

### Patch Changes

- Updated dependencies [61b0fd1]
  - @atcute/lexicons@1.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [6abad75]
- Updated dependencies [5310da3]
- Updated dependencies [3125bf6]
- Updated dependencies [5ec9a3c]
- Updated dependencies [69db9c7]
  - @atcute/lexicons@1.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [d02554d]
- Updated dependencies [af85dca]
  - @atcute/bluesky@3.0.0
