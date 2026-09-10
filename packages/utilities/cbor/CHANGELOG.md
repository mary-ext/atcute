# @atcute/cbor

## 2.3.7

### Patch Changes

- 083f557: reduce CBOR allocation and retained memory for large values, and avoid quadratic
  canonical key sorting on wide maps. decoded CIDs and small byte strings no longer retain
  disproportionately large input buffers, while large byte strings remain zero-copy.

## 2.3.6

### Patch Changes

- 72fe990: `decodeUtf8From` now throws on malformed UTF-8 instead of substituting U+FFFD.
- e988009: `fromBytes` now accepts padded `$bytes` values.
- b72c247: fix string encoding corrupting emojis and some other non-ASCII characters
- Updated dependencies [72fe990]
- Updated dependencies [87f3666]
- Updated dependencies [89f5536]
- Updated dependencies [d18b465]
- Updated dependencies [06d2f55]
- Updated dependencies [9738798]
- Updated dependencies [ffea168]
- Updated dependencies [ea64aa0]
  - @atcute/uint8array@1.1.5
  - @atcute/multibase@1.2.5

## 2.3.5

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/multibase@1.2.4
  - @atcute/uint8array@1.1.3
  - @atcute/cid@2.4.2

## 2.3.4

### Patch Changes

- 5cbefa3: sort map keys by their utf-8 bytes so maps with non-ascii keys encode and decode in
  canonical order, rather than by utf-16 code units
- 09edf9d: reject decoding the negative integer one past the safe-integer range (-(2^53)), which the
  encoder could not round-trip
- ff1bb77: reject NaN and infinity floats when decoding, matching the encoder
- 0c30865: reject truncated and out-of-bounds input when decoding, instead of silently returning
  partial values or pre-allocating an array larger than the remaining input
- Updated dependencies [5afc172]
- Updated dependencies [ac4d22b]
- Updated dependencies [ebcc548]
- Updated dependencies [4842999]
- Updated dependencies [40082d8]
  - @atcute/multibase@1.2.2

## 2.3.3

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.

## 2.3.2

### Patch Changes

- a891529: quickly bail out to slow path on server runtimes
- Updated dependencies [b9e9152]
- Updated dependencies [fe963f8]
- Updated dependencies [441b28a]
- Updated dependencies [b3d0852]
- Updated dependencies [ffc3f54]
- Updated dependencies [0c56e4b]
  - @atcute/multibase@1.1.8
  - @atcute/uint8array@1.1.1
  - @atcute/cid@2.4.1

## 2.3.1

### Patch Changes

- 0cfed5a: improve cbor encode/decode

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
