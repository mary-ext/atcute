# @atcute/cbor

## 2.3.0

### Minor Changes

- 0795806: update to DASL spec 2025-10-20
  - remove support for empty CIDs (zero-length digests), which were removed from the spec
  - reject `Infinity` values in CBOR encoder (in addition to `NaN`)
  - optimize streamed CAR reader by removing buffer concatenation for CID reads

### Patch Changes

- Updated dependencies [0795806]
  - @atcute/cid@2.4.0

## 2.2.8

### Patch Changes

- 7d3a159: perf improvements

## 2.2.7

### Patch Changes

- 5bbd5be: `isBytes` function for Bytes interface
- 4653fe5: memoize toString results
- Updated dependencies [4653fe5]
- Updated dependencies [bd7df47]
  - @atcute/cid@2.2.5

## 2.2.6

### Patch Changes

- 4393144: explicitly clarify `Uint8Array<ArrayBuffer>` for encode
- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [b30da0e]
  - @atcute/uint8array@1.0.5
  - @atcute/multibase@1.1.6
  - @atcute/cid@2.2.4

## 2.2.5

### Patch Changes

- 827a34a: throw on non-canonical map encoding
- ad2821f: throw on non-canonical argument encoding
- 04fca43: throw on improper CID

## 2.2.4

### Patch Changes

- Updated dependencies [ede65cf]
  - @atcute/uint8array@1.0.2
  - @atcute/cid@2.2.3
  - @atcute/multibase@1.1.4

## 2.2.3

### Patch Changes

- b6ea3f3: internal identity symbol
- Updated dependencies [e55a918]
  - @atcute/cid@2.2.2

## 2.2.2

### Patch Changes

- 9ea1e46: inline readTypeInfo
- fce1e2c: optimize string key decoding
- 745e12b: move readArgument inside types

## 2.2.1

### Patch Changes

- 3972bbf: lazily initialize DataView
- Updated dependencies [5aedfc5]
  - @atcute/multibase@1.1.3
  - @atcute/cid@2.2.1

## 2.2.0

### Minor Changes

- 73a8c32: expose Bytes interface as a separate exports

### Patch Changes

- Updated dependencies [4e678dd]
- Updated dependencies [e56e6df]
- Updated dependencies [fdfd8a8]
- Updated dependencies [e446f57]
- Updated dependencies [c30d2eb]
  - @atcute/cid@2.2.0
