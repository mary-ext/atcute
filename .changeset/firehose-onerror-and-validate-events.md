---
'@atcute/firehose': major
---

rename `validateMessages` to `validateEvents`, redesign `onError`

`onError` is now `(err: unknown) => void`. atproto error frames surface as the new `FirehoseError`,
and validation failures surface as `ValidationError` from `@atcute/lexicons` instead of being
silently dropped.

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
