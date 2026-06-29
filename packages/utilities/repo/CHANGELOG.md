# @atcute/repo

## 1.0.2

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/lexicons@2.0.2
  - @atcute/crypto@2.4.2
  - @atcute/uint8array@1.1.3
  - @atcute/cbor@2.3.5
  - @atcute/car@6.0.2
  - @atcute/cid@2.4.2
  - @atcute/mst@1.0.2

## 1.0.1

### Patch Changes

- f1a35e4: accept car archives that declare more than one root, reading the repository from the
  first root as the spec allows
- 144f9e3: bound mst traversal depth and node entry counts to reject hostile car archives that would
  otherwise exhaust the stack or amplify processing cost
- 836f44b: validate mst node key prefix lengths, prefix compaction, and sort order while reading,
  rejecting malformed nodes instead of yielding corrupt keys
- ff9eb3b: reject records whose repo path is not a valid `<collection>/<record-key>` pair instead of
  splitting on the first slash
- bf8f0ce: verify a record's inclusion by descending only the proof path to its key, instead of
  walking and hashing the entire tree
- Updated dependencies [53b7f47]
- Updated dependencies [307f10d]
- Updated dependencies [fb8b1e8]
- Updated dependencies [07da59d]
- Updated dependencies [2501e17]
- Updated dependencies [ef3624b]
- Updated dependencies [5cbefa3]
- Updated dependencies [09edf9d]
- Updated dependencies [ff1bb77]
- Updated dependencies [0c30865]
- Updated dependencies [c1cf758]
  - @atcute/car@6.0.1
  - @atcute/cbor@2.3.4
  - @atcute/lexicons@2.0.1

## 1.0.0

### Patch Changes

- Updated dependencies [319676a]
- Updated dependencies [d64ddf1]
  - @atcute/car@6.0.0
  - @atcute/lexicons@2.0.0

## 0.1.5

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/car@5.1.2
  - @atcute/cbor@2.3.3
  - @atcute/mst@1.0.1
  - @atcute/lexicons@1.3.1

## 0.1.4

### Patch Changes

- 2287359: fix streaming reader losing records when multiple MST entries reference the same CID

## 0.1.3

### Patch Changes

- Updated dependencies [812b68e]
- Updated dependencies [194a382]
  - @atcute/crypto@2.4.0
  - @atcute/mst@1.0.0

## 0.1.2

### Patch Changes

- 9ccc7ef: improve mst key splitting
- Updated dependencies [a891529]
- Updated dependencies [4bd4ff0]
- Updated dependencies [95dfb99]
- Updated dependencies [6e63aab]
- Updated dependencies [fe963f8]
- Updated dependencies [441b28a]
- Updated dependencies [ab76dda]
- Updated dependencies [ffc3f54]
  - @atcute/cbor@2.3.2
  - @atcute/car@5.1.1
  - @atcute/lexicons@1.2.9
  - @atcute/uint8array@1.1.1
  - @atcute/cid@2.4.1

## 0.1.1

### Patch Changes

- 168aa20: export Commit interface
