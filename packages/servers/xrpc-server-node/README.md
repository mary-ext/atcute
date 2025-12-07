# @atcute/xrpc-server-node

Node.js WebSocket adapter for [`@atcute/xrpc-server`](../xrpc-server/).

```sh
npm install @atcute/xrpc-server-node
```

see the [subscriptions section](../xrpc-server/#subscriptions) in the main package for usage details.

```ts
import { serve } from '@hono/node-server';
import { XRPCRouter } from '@atcute/xrpc-server';
import { createNodeWebSocket } from '@atcute/xrpc-server-node';

import { ComExampleSubscribe } from './lexicons/index.js';

const ws = createNodeWebSocket();
const router = new XRPCRouter({ websocket: ws.adapter });

router.addSubscription(ComExampleSubscribe.mainSchema, {
	async *handler({ params, signal }) {
		while (!signal.aborted) {
			yield {
				// ...
			};
		}
	},
});

const server = serve({ fetch: router.fetch, port: 3000 }, (info) => {
	console.log(`listening on port ${info.port}`);
});

ws.injectWebSocket(server, router);
```
