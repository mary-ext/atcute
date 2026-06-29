# @atcute/varint

## 2.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish

## 2.0.0

### Major Changes

- 4bd4ff0: alter the return shape of `decode()`

  `decode()` now returns `{ value, nextOffset }` instead of `[value, nextOffset]`, on Bun this seems
  to make a noticeable improvement.

- 4bd4ff0: `decode()` and `encode()` functions no longer takes in a number array

  you have to use Uint8Array

### Minor Changes

- 4bd4ff0: allow passing offset and length to `decode()`

  `decode()` now allows specifying the offset to read from, removing the need to subarray/slice the
  buffer before passing to the decoder.

## 1.0.4

### Patch Changes

- b622292: unroll varint encode/decode

## 1.0.3

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
