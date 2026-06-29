# @atcute/uint8array

## 1.1.3

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish

## 1.1.2

### Patch Changes

- 3cfc6d0: silence Rollup `/*#__PURE__*/` warnings

  Rollup-based bundlers (Vite, Astro SSR, etc.) used to warn that the package's `/*#__PURE__*/`
  annotations sat on plain member reads — a position Rollup ignores. The annotations now apply to
  IIFE calls, which Rollup recognizes.

## 1.1.1

### Patch Changes

- fe963f8: avoid calling `buf.subarray()` in `decodeUtf8From()` unless necessary on browser runtime
- 441b28a: missing fast path for isUtf8LengthInRange in Node.js and Bun

## 1.1.0

### Minor Changes

- a60d862: add isUtf8LengthInRange function
- 2772033: add randomBytes function

## 1.0.6

### Patch Changes

- a562b63: add getUtf8Length
- 1b2c79f: improve UTF-8 decode for Node.js

## 1.0.5

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig

## 1.0.4

### Patch Changes

- 5241c38: fix typing issue around Uint8Array defaulting to ArrayBufferLike instead of ArrayBuffer

## 1.0.3

### Patch Changes

- 0e6e5eb: add `encodeUtf8` function, some minor perf optimization

## 1.0.2

### Patch Changes

- ede65cf: attempt fast-path ASCII-only decoding for small strings
