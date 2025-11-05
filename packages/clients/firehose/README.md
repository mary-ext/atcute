# @atcute/firehose

lightweight and cute XRPC subscription client for AT Protocol.

```ts
import { FirehoseSubscription } from '@atcute/firehose';
import { ComAtprotoSyncSubscribeRepos } from '@atcute/atproto';

let cursor: number | undefined;

const subscription = new FirehoseSubscription({
	service: ['wss://bsky.network'],
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
	params: () => ({ cursor }),
});

for await (const message of subscription) {
	if (message.$type === 'com.atproto.sync.subscribeRepos#commit') {
		cursor = message.seq;
		console.log('commit:', message.seq, message.repo);
	}
}
```
