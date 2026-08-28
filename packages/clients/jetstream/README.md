# @atcute/jetstream

lightweight Jetstream subscriber for AT Protocol.

```sh
npm install @atcute/jetstream
```

[Jetstream](https://docs.bsky.app/blog/jetstream) is a streaming service that delivers a filtered
firehose of AT Protocol events as JSON over WebSocket. this package provides a client to subscribe
to those events.

## usage

### subscribing to events

```ts
import { subscribeEvents } from '@atcute/jetstream';

const events = subscribeEvents({
	service: 'wss://jetstream.us-east.bsky.network',
});

for await (const message of events) {
	console.log(message.$type, message.seq, message.did);
}
```

the connection opens when iteration starts, reconnects automatically, and closes when iteration
ends. `service` accepts one host because v2 sequence cursors are specific to a Jetstream instance.

### filtering

filters are combined and match everything when omitted or empty:

```ts
const postEvents = subscribeEvents({
	service: 'wss://jetstream.us-east.bsky.network',
	collections: ['app.bsky.feed.post', 'app.bsky.graph.*'],
	dids: ['did:plc:z72i7hdynmk6r22z27h6tvur'],
	kinds: ['commit'],
});
```

`collections` only filters commit events. combine it with `kinds: ['commit']` to exclude identity,
account, and sync events.

### handling event types

use `$type` to narrow an event before accessing its fields:

```ts
for await (const message of events) {
	switch (message.$type) {
		case 'network.bsky.jetstream.subscribeEvents#commit': {
			console.log(message.operation, message.collection, message.rkey, message.record);
			break;
		}

		case 'network.bsky.jetstream.subscribeEvents#identity': {
			console.log(message.identity.handle);
			break;
		}

		case 'network.bsky.jetstream.subscribeEvents#account': {
			console.log(message.account.active, message.account.status);
			break;
		}

		case 'network.bsky.jetstream.subscribeEvents#sync': {
			console.log(message.sync.rev);
			break;
		}
	}
}
```

commit fields are placed directly on the message. identity, account, and sync messages wrap the
corresponding upstream relay event. event types unknown to this version of the package are skipped
without advancing the cursor.

### validating records

event envelopes are validated by default, but commit `record` values remain unvalidated JSON. narrow
them with `is()` from `@atcute/lexicons`:

```ts
import { AppBskyFeedPost } from '@atcute/bluesky';
import { is } from '@atcute/lexicons';

for await (const message of events) {
	if (message.$type !== 'network.bsky.jetstream.subscribeEvents#commit') {
		continue;
	}

	if (is(AppBskyFeedPost.mainSchema, message.record)) {
		console.log(`@${message.did}: ${message.record.text}`);
	}
}
```

set `validateEvents: false` to skip envelope validation. records must still be validated separately.

### resuming from a cursor

pass a sequence number to start from, or a `CursorStore` to load and save the position:

```ts
import { readFile, writeFile } from 'node:fs/promises';

const events = subscribeEvents({
	service: 'wss://jetstream.us-east.bsky.network',
	cursor: {
		async load() {
			const saved = await readFile('cursor', 'utf8').catch(() => undefined);
			return saved !== undefined ? Number(saved) : undefined;
		},
		async save(seq) {
			await writeFile('cursor', String(seq));
		},
	},
});
```

`load` decides where the subscription starts, and it is consulted again on every reconnection rather
than only on the first connection, so a store written elsewhere takes effect on the next connection
attempt. returning `undefined` starts from the live tip. a sequence number is treated as a store
that only lasts for the subscription.

the stored cursor advances when the consumer asks for the next event. writes are limited by
`cursorSaveInterval`, which defaults to 5 seconds; a pending write is flushed before reconnecting
and when iteration ends. set the interval to `0` to save every event.

a store failure while connecting is reported to `onConnectionError` and the connection attempt is
retried. a `save` failure during iteration is thrown, except for the final flush, which goes to
`onError` so it does not mask why iteration ended.

delivery is at least once. reconnect duplicates are removed while the same iterator is running, but
a new iterator may replay its saved cursor event. event handlers should therefore be idempotent.

### cancelling the subscription

an `AbortSignal` stops the stream. iteration rejects with `signal.reason` after flushing any pending
cursor:

```ts
const events = subscribeEvents({
	service: 'wss://jetstream.us-east.bsky.network',
	signal: AbortSignal.timeout(10_000),
});
```

### handling errors

`onError` receives malformed frames, validation failures, and server error frames. server errors use
`FirehoseError`:

```ts
import { FirehoseError, subscribeEvents } from '@atcute/jetstream';

const events = subscribeEvents({
	service: 'wss://jetstream.us-east.bsky.network',
	onError: (err) => {
		if (err instanceof FirehoseError) {
			console.error('jetstream sent', err.error);
		} else {
			console.error('jetstream error:', err);
		}
	},
});
```

errors returned before the WebSocket upgrade, including `CursorTooOld` and `InvalidRequest`, are not
visible to WebSocket clients and look like connection failures. they are retried by default; use
`ws.maxRetries` to set a limit. reaching the limit stops reconnection but leaves the iterator open.

### connection options

`onConnectionOpen`, `onConnectionClose`, and `onConnectionError` report the socket lifecycle, and
`ws` passes options to the underlying
[partysocket](https://github.com/partykit/partykit/tree/main/packages/partysocket) WebSocket:

```ts
const events = subscribeEvents({
	service: 'wss://jetstream.us-east.bsky.network',
	onConnectionClose: (event) => console.log('disconnected', event.code, event.reason),
	ws: {
		minReconnectionDelay: 1_000,
		maxReconnectionDelay: 30_000,
	},
});
```
