# @atcute/jetstream

## 2.0.2

### Patch Changes

- 687f266: route malformed messages to `onError` instead of throwing.
- Updated dependencies [9882a31]
- Updated dependencies [cb01440]
- Updated dependencies [96c679b]
- Updated dependencies [f31de6d]
- Updated dependencies [0e039ef]
  - @atcute/lexicons@2.0.3

## 2.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/lexicons@2.0.2

## 2.0.0

### Major Changes

- e8add56: migrate from `@badrap/valita` to `valibot`

  exported event schemas are now valibot schemas.

  ```ts
  import * as v from 'valibot';
  import { commitEventSchema } from '@atcute/jetstream';

  // before
  const result = commitEventSchema.try(input);

  // after
  const result = v.safeParse(commitEventSchema, input);
  ```

### Minor Changes

- 777e60f: add an `onError` option

  validation failures (a valibot `ValiError`) are now passed to `onError` instead of being silently
  dropped.

  ```ts
  new JetstreamSubscription({
  	onError: (err) => {
  		// `err` is a `ValiError` for validation failures
  	},
  });
  ```

  `updateOptions` no longer reconnects when only `cursor` is passed and matches the current cursor.
  filter-only updates still go in-band; cursor changes or other option changes still reconnect.

### Patch Changes

- Updated dependencies [d64ddf1]
  - @atcute/lexicons@2.0.0

## 1.1.3

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/lexicons@1.3.1

## 1.1.2

### Patch Changes

- dc9fe6f: clean up Valita schemas

## 1.1.1

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2

## 1.1.0

### Minor Changes

- 28b7f2f: allow passing multiple Jetstream instances for a random selection

### Patch Changes

- 3dc44e6: do not rollback the cursor on new messages

## 1.0.2

### Patch Changes

- Updated dependencies [61b0fd1]
  - @atcute/lexicons@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [6abad75]
- Updated dependencies [5310da3]
- Updated dependencies [3125bf6]
- Updated dependencies [5ec9a3c]
- Updated dependencies [69db9c7]
  - @atcute/lexicons@1.0.1
