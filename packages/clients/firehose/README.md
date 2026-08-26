# @atcute/firehose

lightweight XRPC subscription client for AT Protocol.

```sh
npm install @atcute/firehose
```

this package provides a generic client for XRPC subscriptions - the WebSocket-based streaming
protocol used by AT Protocol. it handles frame decoding, automatic reconnection, and optional schema
validation.

for consuming the Bluesky network firehose specifically, consider using `@atcute/jetstream` instead,
which provides a simpler JSON-based interface.

## usage

### subscribing to the relay firehose

```ts
import { FirehoseSubscription } from '@atcute/firehose';
import { ComAtprotoSyncSubscribeRepos } from '@atcute/atproto';

const subscription = new FirehoseSubscription({
	service: 'wss://bsky.network',
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
});

for await (const message of subscription) {
	console.log(message.$type, message.seq);
}
```

the connection opens when you start iterating and closes when you break out of the loop. the
underlying WebSocket automatically reconnects on disconnection.

### cancelling the subscription

pass an `AbortSignal` to close the connection and reject iteration:

```ts
const subscription = new FirehoseSubscription({
	service: 'wss://bsky.network',
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
	signal: AbortSignal.timeout(10_000),
});

for await (const message of subscription) {
	console.log(message.$type);
}
```

### handling message types

messages include a `$type` field indicating their type:

```ts
for await (const message of subscription) {
	switch (message.$type) {
		case 'com.atproto.sync.subscribeRepos#commit': {
			// repository commit (record creates, updates, deletes)
			console.log('commit:', message.repo, message.rev);
			break;
		}

		case 'com.atproto.sync.subscribeRepos#handle': {
			// handle change
			console.log('handle:', message.did, message.handle);
			break;
		}

		case 'com.atproto.sync.subscribeRepos#migrate': {
			// account migration
			console.log('migrate:', message.did, message.migrateTo);
			break;
		}

		case 'com.atproto.sync.subscribeRepos#tombstone': {
			// account deletion
			console.log('tombstone:', message.did);
			break;
		}

		case 'com.atproto.sync.subscribeRepos#identity': {
			// identity update
			console.log('identity:', message.did);
			break;
		}

		case 'com.atproto.sync.subscribeRepos#account': {
			// account status change
			console.log('account:', message.did, message.active);
			break;
		}
	}
}
```

### tracking cursor for resumption

use a function for `params` to provide the current cursor on each connection attempt:

```ts
let cursor: number | undefined;

// load saved cursor if resuming
const saved = localStorage.getItem('firehose-cursor');
if (saved) {
	cursor = Number(saved);
}

const subscription = new FirehoseSubscription({
	service: 'wss://bsky.network',
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
	// function is called on each connection/reconnection
	params: () => ({ cursor }),
});

for await (const message of subscription) {
	if ('seq' in message) {
		cursor = message.seq;

		// periodically save cursor for recovery
		if (cursor % 1000 === 0) {
			localStorage.setItem('firehose-cursor', String(cursor));
		}
	}
}
```

the params function is called on each connection attempt, so when the WebSocket reconnects after a
disconnection, it automatically uses the latest cursor value.

### using multiple servers

pass an array of URLs for automatic failover. the client randomly selects one on each connection:

```ts
const subscription = new FirehoseSubscription({
	service: ['wss://bsky.network', 'wss://bsky-relay.example.com'],
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
});
```

### handling errors

XRPC subscriptions can send error frames. handle them with the `onError` callback:

```ts
const subscription = new FirehoseSubscription({
	service: 'wss://bsky.network',
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
	onError(err) {
		console.error('firehose error:', err);
		// common errors:
		// - "FutureCursor": cursor is ahead of the server
		// - "ConsumerTooSlow": client is not consuming messages fast enough
	},
});
```

### connection lifecycle callbacks

handle connection events for logging or UI updates:

```ts
const subscription = new FirehoseSubscription({
	service: 'wss://bsky.network',
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
	onConnectionOpen(event) {
		console.log('connected to firehose');
	},
	onConnectionClose(event) {
		console.log('disconnected:', event.code, event.reason);
	},
	onConnectionError(event) {
		console.error('connection error:', event.error);
	},
});
```

### updating options at runtime

change options using `updateOptions()`. this triggers a reconnection:

```ts
const subscription = new FirehoseSubscription({
	service: 'wss://bsky.network',
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
});

// later, switch to a different service
subscription.updateOptions({
	service: 'wss://different-relay.example.com',
});
```

### disabling message validation

by default, messages are validated against the schema. disable this for better performance if you
trust the server:

```ts
const subscription = new FirehoseSubscription({
	service: 'wss://bsky.network',
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
	validateEvents: false,
});
```

### WebSocket options

pass options to the underlying
[partysocket](https://github.com/partykit/partykit/tree/main/packages/partysocket) WebSocket for
custom reconnection behavior:

```ts
const subscription = new FirehoseSubscription({
	service: 'wss://bsky.network',
	nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
	ws: {
		maxRetries: 10,
		minReconnectionDelay: 1000,
		maxReconnectionDelay: 30000,
	},
});
```
