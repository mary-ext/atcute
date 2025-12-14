# @atcute/tap

an atproto Tap client.

```sh
npm install @atcute/tap
```

Tap is a sync utility that connects to the relay firehose, verifies data, performs backfill, and
streams simple JSON events to clients over a local websocket.

## usage

```ts
import { TapClient } from '@atcute/tap';

const tap = new TapClient({
	url: 'http://localhost:2480',
	// adminPassword: process.env.TAP_ADMIN_PASSWORD,
});

await tap.addRepos(['did:plc:...']);

for await (const { event, ack } of tap.subscribe()) {
	// process event idempotently
	await ack();
}
```

## acks

Tap’s default mode requires that clients acknowledge each event after it has been processed. if you
don’t call `ack()`, Tap will retry delivery later.
