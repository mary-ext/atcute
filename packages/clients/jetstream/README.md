# @atcute/jetstream

lightweight Jetstream subscriber for AT Protocol.

```sh
npm install @atcute/jetstream
```

[Jetstream](https://docs.bsky.app/blog/jetstream) is a streaming service that delivers a filtered
firehose of events from the AT Protocol network over WebSocket. this package provides a simple
client to subscribe to these events.

## usage

### subscribing to events

create a subscription and iterate over events with `for await`:

```ts
import { JetstreamSubscription } from '@atcute/jetstream';

const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
});

for await (const event of subscription) {
	console.log(event.kind, event.did);
}
```

the connection opens when you start iterating and closes when you break out of the loop. the
underlying WebSocket automatically reconnects on disconnection.

### filtering by collection

use `wantedCollections` to receive only events for specific record types:

```ts
const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
	wantedCollections: ['app.bsky.feed.post', 'app.bsky.feed.like'],
});

for await (const event of subscription) {
	if (event.kind === 'commit') {
		console.log(event.commit.collection, event.commit.operation);
		// -> "app.bsky.feed.post" "create"
	}
}
```

### filtering by account

use `wantedDids` to receive only events from specific accounts:

```ts
const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
	wantedDids: ['did:plc:z72i7hdynmk6r22z27h6tvur'], // @bsky.app
});
```

### handling event types

jetstream delivers three kinds of events:

```ts
for await (const event of subscription) {
	switch (event.kind) {
		case 'commit': {
			// record was created, updated, or deleted
			const { collection, operation, rkey, rev } = event.commit;

			if (operation === 'create' || operation === 'update') {
				// record and cid are available on create/update
				console.log(event.commit.record);
			}

			break;
		}

		case 'identity': {
			// handle or DID document changed
			const { did, handle, seq, time } = event.identity;
			break;
		}

		case 'account': {
			// account status changed (activated, deactivated, etc.)
			const { did, active, seq, time } = event.account;
			break;
		}
	}
}
```

### validating records

jetstream events include the raw record data. use `is()` from `@atcute/lexicons` to validate and
narrow the type:

```ts
import { JetstreamSubscription } from '@atcute/jetstream';
import { is } from '@atcute/lexicons';

import { AppBskyFeedPost } from '@atcute/bluesky';

const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
	wantedCollections: ['app.bsky.feed.post'],
});

for await (const event of subscription) {
	if (event.kind !== 'commit') {
		continue;
	}

	const commit = event.commit;
	if (commit.operation !== 'create') {
		continue;
	}

	// validate the record against the schema
	if (!is(AppBskyFeedPost.mainSchema, commit.record)) {
		console.warn('invalid record', commit.record);
		continue;
	}

	// commit.record is now typed as AppBskyFeedPost.$record
	console.log(`@${event.did}: ${commit.record.text}`);
}
```

### resuming from a cursor

jetstream supports cursors for resuming from a specific point. the cursor is a timestamp in
microseconds:

```ts
const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
	// resume from a saved cursor
	cursor: 1699900000000000,
});

// save the cursor periodically to resume later
setInterval(() => {
	localStorage.setItem('jetstream-cursor', String(subscription.cursor));
}, 5_000);
```

when switching between jetstream instances (e.g., when using multiple URLs for failover), the client
automatically rolls back the cursor by 10 seconds to avoid missing events due to clock differences.

### using multiple servers

pass an array of URLs for automatic failover. the client randomly selects one on each connection:

```ts
const subscription = new JetstreamSubscription({
	url: [
		'wss://jetstream1.us-east.bsky.network',
		'wss://jetstream2.us-east.bsky.network',
		'wss://jetstream1.us-west.bsky.network',
		'wss://jetstream2.us-west.bsky.network',
	],
});
```

### updating options at runtime

change filters without reconnecting using `updateOptions()`:

```ts
// start with all collections
const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
});

// later, filter to only posts
subscription.updateOptions({
	wantedCollections: ['app.bsky.feed.post'],
});

// add accounts to filter
subscription.updateOptions({
	wantedDids: ['did:plc:...'],
});
```

changes to `wantedCollections` and `wantedDids` are sent to the server without reconnecting. other
option changes trigger a reconnection.

### connection lifecycle callbacks

handle connection events for logging or UI updates:

```ts
const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
	onConnectionOpen(event) {
		console.log('connected to jetstream');
	},
	onConnectionClose(event) {
		console.log('disconnected from jetstream', event.code, event.reason);
	},
	onConnectionError(event) {
		console.error('jetstream error', event.error);
	},
});
```

### disabling event validation

by default, jetstream events are validated. disable this for slightly better performance if you
trust the server:

```ts
const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
	validateEvents: false,
});
```

note: this only disables validation of the event envelope. you should still validate records using
`is()` from `@atcute/lexicons`.

### WebSocket options

pass options to the underlying
[partysocket](https://github.com/partykit/partykit/tree/main/packages/partysocket) WebSocket for
custom reconnection behavior:

```ts
const subscription = new JetstreamSubscription({
	url: 'wss://jetstream2.us-east.bsky.network',
	ws: {
		maxRetries: 10,
		minReconnectionDelay: 1000,
		maxReconnectionDelay: 30000,
	},
});
```
