# @atcute/mst

## 1.0.3

### Patch Changes

- 3985a4f: fix `MSTNode.deserialize` accepting negative or fractional key prefix lengths, which
  decoded a node into keys that re-serialize to a different CID
- Updated dependencies [72fe990]
- Updated dependencies [e988009]
- Updated dependencies [89f5536]
- Updated dependencies [ffea168]
- Updated dependencies [b72c247]
- Updated dependencies [ea64aa0]
  - @atcute/uint8array@1.1.5
  - @atcute/cbor@2.3.6

## 1.0.2

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/uint8array@1.1.3
  - @atcute/cbor@2.3.5
  - @atcute/cid@2.4.2

## 1.0.1

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
  - @atcute/cbor@2.3.3

## 1.0.0

### Major Changes

- 194a382: replace enums with plain objects

  `DeltaType` is now an `as const` object with a companion type alias.

## 0.1.2

### Patch Changes

- 4c63560: precompute empty node CID

## 0.1.1

### Patch Changes

- 62d7b22: add MST key validation
