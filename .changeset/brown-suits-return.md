---
'@atcute/client': minor
---

opt-in runtime validation for XRPC calls

by default, `@atcute/client` assumes the server is trusted and skips runtime validation. you can now
opt into validation using the new `call()` method with lexicon schemas.

```ts
import { Client, simpleFetchHandler } from '@atcute/client';
import * as AppBskyActorGetProfile from '@atcute/bluesky/types/actor/getProfile';

const client = new Client({
	handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
});

// validates params, input, and output against lexicon schema
const { ok, data } = await client.call(AppBskyActorGetProfile, {
	params: { actor: 'bsky.app' },
});
```

validation failures throw `ClientValidationError` with detailed error information.

validation code is automatically tree-shaken when not used.
