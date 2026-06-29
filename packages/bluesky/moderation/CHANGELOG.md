# @atcute/bluesky-moderation

## 4.2.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/lexicons@2.0.2

## 4.2.0

### Minor Changes

- 20d752e: export `BUILTIN_LABELS`, the mapping of Bluesky's built-in label definitions

## 4.1.0

### Minor Changes

- cea8506: honor `expiresAt` on muted word filters; expired filters no longer match
- 5b55365: add the `ProfileBio` display context for a profile's display name and description,
  blurred by forced labels (`!hide`, `!warn`, `!no-unauthenticated`) but not by media labels such as
  `porn`
- 15fe3f2: add `moderateStatus` for moderating account live statuses

### Patch Changes

- a1bbf74: consider mutes on the author of a blocked quote post
- 23559d0: match hashtags against content-targeted muted words, not just tag-targeted ones
- 391ed17: fix an empty or whitespace-only keyword filter matching every post instead of nothing
- 70b6a0c: fix hidden post detection to match quoted posts against their own uri
- 47c17b6: fix label cause `source` to hold the labeler did; it is now null only for self-applied
  labels
- 757b46a: normalize every whitespace gap in a multi-word keyword, not just the first, so phrases
  match regardless of spacing
- 02c845f: apply `temporaryMutes` during profile moderation; the preference previously had no effect

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
