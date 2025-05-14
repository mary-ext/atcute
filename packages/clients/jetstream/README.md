# @atcute/jetstream

a simple Jetstream client

```ts
import { JetstreamSubscription } from '@atcute/jetstream';
import { is } from '@atcute/lexicons';

import { AppBskyFeedPost } from '@atcute/bluesky';

const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
	wantedCollections: ['app.bsky.feed.post'],
});

for await (const event of subscription) {
	if (event.kind === 'commit') {
		const commit = event.commit;

		if (commit.collection !== 'app.bsky.feed.post') {
			continue;
		}

		if (commit.operation === 'create') {
			const record = commit.record;
			if (!is(AppBskyFeedPost.mainSchema, record)) {
				continue;
			}

			console.log(`${record.text}`);
		}
	}
}
```
