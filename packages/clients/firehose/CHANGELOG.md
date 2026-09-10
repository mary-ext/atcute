# @atcute/firehose

## 1.2.0

### Minor Changes

- 08ea59a: add support for cancelling subscriptions with an AbortSignal.
- 91856f2: allow the subscription `params` function to return a promise.

### Patch Changes

- 9fabffc: use schema input types for subscription params, preserving optional defaulted fields.
- Updated dependencies [083f557]
  - @atcute/cbor@2.3.7

## 1.1.0

### Minor Changes

- 2502a1d: add support for `xrpc.v1.json` and `xrpc.v1.cbor` subscription frames.

### Patch Changes

- Updated dependencies [a73fa3b]
  - @atcute/lexicons@2.1.0

## 1.0.2

### Patch Changes

- 0ac9a3e: fix array subscription params being sent comma-joined instead of as repeated keys.
- 41b39e4: route malformed frames to `onError` instead of throwing.
- Updated dependencies [9882a31]
- Updated dependencies [72fe990]
- Updated dependencies [cb01440]
- Updated dependencies [e988009]
- Updated dependencies [96c679b]
- Updated dependencies [f31de6d]
- Updated dependencies [89f5536]
- Updated dependencies [ffea168]
- Updated dependencies [0e039ef]
- Updated dependencies [b72c247]
- Updated dependencies [ea64aa0]
  - @atcute/lexicons@2.0.3
  - @atcute/uint8array@1.1.5
  - @atcute/cbor@2.3.6

## 1.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/lexicons@2.0.2
  - @atcute/uint8array@1.1.3
  - @atcute/cbor@2.3.5

## 1.0.0

### Major Changes

- 385a925: rename `validateMessages` to `validateEvents`, redesign `onError`

  `onError` is now `(err: unknown) => void`. atproto error frames surface as the new
  `FirehoseError`, and validation failures surface as `ValidationError` from `@atcute/lexicons`
  instead of being silently dropped.

  ```ts
  import { FirehoseError, FirehoseSubscription } from '@atcute/firehose';
  import { ValidationError } from '@atcute/lexicons';

  // before
  new FirehoseSubscription({
  	validateMessages: true,
  	onError: (error, message) => {},
  });

  // after
  new FirehoseSubscription({
  	validateEvents: true,
  	onError: (err) => {
  		if (err instanceof FirehoseError) {
  		}
  		if (err instanceof ValidationError) {
  		}
  	},
  });
  ```

### Patch Changes

- Updated dependencies [d64ddf1]
  - @atcute/lexicons@2.0.0

## 0.1.1

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/cbor@2.3.3
  - @atcute/lexicons@1.3.1
