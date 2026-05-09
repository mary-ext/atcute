# @atcute/firehose

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
