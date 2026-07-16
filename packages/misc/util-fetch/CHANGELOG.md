# @atcute/util-fetch

## 2.0.2

### Patch Changes

- 5a96785: fix DoH resolution failing on CNAME'd names.
- 09790f0: match response content-types case-insensitively.
- 241e65d: accept empty response bodies.

## 2.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish

## 2.0.0

### Major Changes

- ceea6eb: migrate from `@badrap/valita` to `valibot`

  `validateJsonWith` now takes a valibot schema (`v.GenericSchema<unknown, T>`); the `mode` option
  is gone — encode passthrough into the schema with `v.looseObject` if needed. the exported
  `dohJsonTxtResult` schema is also valibot now.

  ```ts
  import * as v from 'valibot';
  import { dohJsonTxtResult, validateJsonWith } from '@atcute/util-fetch';

  // before
  const data = await validateJsonWith(response, schema, {
  	mode: 'passthrough',
  });
  const result = dohJsonTxtResult.try(input);

  // after
  const data = await validateJsonWith(response, v.looseObject({/* ... */}));
  const result = v.safeParse(dohJsonTxtResult, input);
  ```

## 1.0.5

### Patch Changes

- 2f34ad8: shared DoH JSON fetch utilities

## 1.0.4

### Patch Changes

- 71d9744: expose response in FailedResponseError

## 1.0.3

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig

## 1.0.2

### Patch Changes

- 8c600c7: await the content-type assertion check
- 8f818fd: fix ArrayBufferView type error

## 1.0.1

### Patch Changes

- 7ecc516: add fallback for missing async iterator in ReadableStream support
