---
'@atcute/bluesky': minor
---

expose record and embed limits as constants

this is a bit of an experiment, the library now exposes the limits set by records and interfaces and
exposes them as constants that you could easily pull in to your clients.

```ts
import { feedPost } from '@atcute/bluesky/limits';

// check if post text exceeds the limit
if (getGraphemeLength(text) > feedPost.text.maxGraphemes) {
	// text is too long
}
```
