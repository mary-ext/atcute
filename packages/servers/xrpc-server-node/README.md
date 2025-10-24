# @atcute/xrpc-server-node

Node.js WebSocket adapter for `@atcute/xrpc-server`.

```ts
import { serve } from '@hono/node-server';
import { XRPCRouter } from '@atcute/xrpc-server';
import { createNodeWebSocket } from '@atcute/xrpc-server-node';

const { adapter, injectWebSocket } = createNodeWebSocket();
const router = new XRPCRouter({ websocket: adapter });

router.addSubscription(ComAtprotoSyncSubscribeRepos.mainSchema, {
	async *handler({ params, signal }) {
		while (!signal.aborted) {
			yield {
				// ...
			};
		}
	},
});

const server = serve(
	{
		fetch: router.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Listening on port ${info.port}`);
	},
);

injectWebSocket(server, router);
```
