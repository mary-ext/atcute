# @atcute/car

## 3.0.4

### Patch Changes

- Updated dependencies [e55a918]
- Updated dependencies [b6ea3f3]
  - @atcute/cid@2.2.2
  - @atcute/cbor@2.2.3

## 3.0.3

### Patch Changes

- Updated dependencies [9ea1e46]
- Updated dependencies [fce1e2c]
- Updated dependencies [745e12b]
  - @atcute/cbor@2.2.2

## 3.0.2

### Patch Changes

- Updated dependencies [3972bbf]
  - @atcute/cbor@2.2.1
  - @atcute/cid@2.2.1

## 3.0.1

### Patch Changes

- ec3f93f: incorrect error description for digest type

## 3.0.0

### Major Changes

- 39da00a: return offsets for CAR headers

  CAR reader will now return start and end ranges for the header. Breaking change as we're no longer
  returning `roots` directly.

- f779d63: store CarEntry into BlockMap

  should make it possible to seek to a certain atproto record at a later time.

### Minor Changes

- 3a5c1fc: yield positions of each CAR entries

  `entryStart`, `entryEnd`, `cidStart`, `cidEnd`, `bytesStart` and `bytesEnd` are now yielded by
  `readCar` function, making it possible to seek to a certain offset at a later time.

### Patch Changes

- 377aadf: skip using varint for CID decode
- 3eb22b9: remove redundant bound checking
- 513beb8: allow empty CIDs
- Updated dependencies [4e678dd]
- Updated dependencies [e56e6df]
- Updated dependencies [fdfd8a8]
- Updated dependencies [73a8c32]
- Updated dependencies [e446f57]
- Updated dependencies [c30d2eb]
  - @atcute/cid@2.2.0
  - @atcute/cbor@2.2.0

## 2.1.0

### Minor Changes

- 1468b42: expose more functions as public API
