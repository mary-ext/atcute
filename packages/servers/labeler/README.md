# @atcute/labeler

sign and emit AT Protocol labels.

```sh
npm install @atcute/labeler
```

provides the core logic for running an AT Protocol labeler like label signing, a subscription outbox
and XRPC operation handlers.

## usage

### setting up a labeler

create a `Labeler` with your signing key and storage backend, then register its routes on a router:

```ts
import { Secp256k1PrivateKey } from '@atcute/crypto';

import { XRPCRouter } from '@atcute/xrpc-server';
import { createBunWebSocket } from '@atcute/xrpc-server-bun';

import { Labeler } from '@atcute/labeler';

const ws = createBunWebSocket();
const router = new XRPCRouter({ websocket: ws.adapter });

const labeler = new Labeler({
	did: 'did:plc:mylabeler',
	key: await Secp256k1PrivateKey.importRaw(keyBytes),
	store: myLabelStore, // implements LabelStore
});

labeler.register(router);

export default ws.wrap(router);
```

`register()` adds two endpoints to the router:

- **`com.atproto.label.queryLabels`** — query stored labels by URI pattern, source, and cursor
- **`com.atproto.label.subscribeLabels`** — WebSocket subscription with backfill and live tailing

### creating labels

```ts
// create a single label
const saved = await labeler.createLabel({
	uri: 'did:plc:targetuser',
	val: 'spam',
});

// create and negate labels for a subject
const labels = await labeler.createLabels(
	{ uri: 'at://did:plc:user/app.bsky.feed.post/abc123', cid: 'bafyrei...' },
	{ create: ['nsfw'], negate: ['misleading'] },
);
```

created labels are signed, saved to the store, and pushed to all active WebSocket subscribers.

### emitEvent endpoint

to accept label creation requests over XRPC (via `tools.ozone.moderation.emitEvent`), provide an
`auth` callback:

```ts
import { AuthRequiredError } from '@atcute/xrpc-server';
import { ServiceJwtVerifier } from '@atcute/xrpc-server/auth';
import {
	CompositeDidDocumentResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
} from '@atcute/identity-resolver';

const jwtVerifier = new ServiceJwtVerifier({
	serviceDid: 'did:plc:mylabeler',
	resolver: new CompositeDidDocumentResolver({
		methods: {
			plc: new PlcDidDocumentResolver(),
			web: new WebDidDocumentResolver(),
		},
	}),
});

const labeler = new Labeler({
	did: 'did:plc:mylabeler',
	key: await Secp256k1PrivateKey.importRaw(keyBytes),
	store: myLabelStore,
	auth: async (request) => {
		const authHeader = request.headers.get('authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return false;
		}

		const result = await jwtVerifier.verify(authHeader.slice(7), {
			lxm: 'tools.ozone.moderation.emitEvent',
		});

		return result.ok;
	},
});
```

when `auth` is provided, the `emitEvent` endpoint is registered alongside the other routes. the
callback receives the incoming `Request` and should return `true` to allow or `false` to reject.

### storage backend

implement the `LabelStore` interface to plug in any database:

```ts
import type { LabelStore } from '@atcute/labeler';

const store: LabelStore = {
	async save(label) {
		// insert label, assign and return a monotonic sequence number
		// label has: src, uri, cid?, val, neg, cts, exp?, sig
	},

	async query({ uriPatterns, sources, cursor, limit }) {
		// query labels matching URI patterns and sources
		// return { labels: [...], cursor: "..." }
	},

	async getLatestSeq() {
		// return the highest sequence number, or 0
	},

	async getRange(after, limit) {
		// return labels with seq > after, ordered by seq
	},
};
```

`save()` receives a signed label (without `seq`) and must assign a monotonically increasing sequence
number. `query()` returns formatted labels for the `queryLabels` endpoint. `getRange()` and
`getLatestSeq()` are used by the subscription outbox for backfill and cursor validation.
