# @atcute/util-text-native

## 1.0.5

### Patch Changes

- 80818bb: fix `isGraphemeLengthInRange` ignoring the maximum bound for empty strings.
- 67f733e: update unicode-segmenter to 0.17.0.

## 1.0.4

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish

## 1.0.3

### Patch Changes

- ae3438d: extend the exact-count fast path from ASCII to Latin-1, so grapheme length checks on
  precomposed accented text skip segmentation

## 1.0.2

### Patch Changes

- 831cc97: fix native prebuilds failing to compile

## 1.0.1

### Patch Changes

- 40082d8: fix undefined behaviour and invalid pointer dereferences in native code
