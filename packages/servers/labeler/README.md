# @atcute/labeler

label signing and subscription engine for AT Protocol.

```sh
npm install @atcute/labeler
```

this package provides the core logic for building an AT Protocol labeler: signing labels with a
service key, persisting them to a store, and streaming them to subscribers. it's framework-agnostic
— wire it up to `@atcute/xrpc-server` or any other server to expose the
`com.atproto.label.subscribeLabels` endpoint.

## usage

### creating a labeler

```ts
import { Labeler, MemoryLabelStore } from '@atcute/labeler';
import { P256PrivateKey, parsePrivateMultikey } from '@atcute/crypto';

const { privateKeyBytes } = parsePrivateMultikey(process.env.SIGNING_KEY!);

const labeler = new Labeler({
	serviceDid: 'did:plc:my-labeler',
	signingKey: await P256PrivateKey.importRaw(privateKeyBytes),
	store: new MemoryLabelStore(),
});
```

`MemoryLabelStore` works for development and testing. for production, implement the `LabelStore`
interface backed by a database.

### applying labels

use `applyLabel()` for a single label or `applyLabels()` for a batch. each label operation specifies
a target URI and a label value:

```ts
// label a post as spam
await labeler.applyLabel({
	uri: 'at://did:plc:alice/app.bsky.feed.post/abc123',
	value: 'spam',
});

// negate a previous label
await labeler.applyLabel({
	uri: 'at://did:plc:alice/app.bsky.feed.post/abc123',
	value: 'spam',
	negate: true,
});

// batch of labels with shared defaults
await labeler.applyLabels(
	[
		{ uri: 'at://did:plc:alice/app.bsky.feed.post/1', value: 'spam' },
		{ uri: 'at://did:plc:alice/app.bsky.feed.post/2', value: 'nudity' },
	],
	{ issuedAt: new Date().toISOString() },
);
```

labels are CBOR-encoded, signed with the service key, and persisted to the store. each stored label
gets a monotonically increasing sequence number.

### subscribing to label events

`subscribeLabels()` returns an async iterator of label events. pass a `cursor` to replay from a
previous sequence number, or omit it to only receive live events:

```ts
// replay from sequence 0 and continue with live events
for await (const event of labeler.subscribeLabels({ cursor: 0, signal: controller.signal })) {
	console.log(event.seq, event.labels);
}
```

the subscription handles backfill (draining stored events) and then seamlessly transitions to live
tailing. if a subscriber falls too far behind, a `ConsumerTooSlowError` is thrown.

### wiring up to an XRPC server

use `@atcute/xrpc-server` with a runtime-specific WebSocket adapter to serve the subscription
endpoint:

```ts
import { XRPCRouter, XRPCSubscriptionError } from '@atcute/xrpc-server';
import { createBunWebSocket } from '@atcute/xrpc-server-bun';
import { ComAtprotoLabelSubscribeLabels } from '@atcute/atproto';

import { FutureCursorError } from '@atcute/labeler';

const ws = createBunWebSocket();
const router = new XRPCRouter({ websocket: ws.adapter });

router.addSubscription(ComAtprotoLabelSubscribeLabels, {
	async *handler({ params, signal }) {
		try {
			for await (const event of labeler.subscribeLabels({ cursor: params.cursor, signal })) {
				yield { $type: 'com.atproto.label.subscribeLabels#labels', ...event };
			}
		} catch (err) {
			if (err instanceof FutureCursorError) {
				throw new XRPCSubscriptionError({ error: 'FutureCursor' });
			}
			throw err;
		}
	},
});

export default ws.wrap(router);
```

## custom label stores

implement the `LabelStore` interface for durable persistence:

```ts
import type { LabelStore, LabelEvent, SignedLabel } from '@atcute/labeler';

class SqliteLabelStore implements LabelStore {
	async appendLabels(labels: SignedLabel[]): Promise<LabelEvent[]> {
		// insert labels and assign sequence numbers
	}

	async getLatestSeq(): Promise<number | null> {
		// return the highest sequence number, or null if empty
	}

	async listLabelEvents(options: { after?: number; limit?: number }): Promise<LabelEvent[]> {
		// return events after the cursor in ascending sequence order
	}
}
```

the store must assign a unique, monotonically increasing `seq` to each event. the labeler uses these
for cursor-based pagination during subscription backfill.
