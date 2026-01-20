# @atcute/xrpc-server-cloudflare

Cloudflare Workers WebSocket adapter for [`@atcute/xrpc-server`](../xrpc-server/).

```sh
npm install @atcute/xrpc-server-cloudflare
```

see the [subscriptions section](../xrpc-server/#subscriptions) in the main package for usage
details.

```ts
import { XRPCRouter } from '@atcute/xrpc-server';
import { createCloudflareWebSocket } from '@atcute/xrpc-server-cloudflare';

import { ComExampleSubscribe } from './lexicons/index.js';

const adapter = createCloudflareWebSocket();
const router = new XRPCRouter({ websocket: adapter });

router.addSubscription(ComExampleSubscribe.mainSchema, {
	async *handler({ params, signal }) {
		while (!signal.aborted) {
			yield {
				// ...
			};
		}
	},
});

export default router satisfies ExportedHandler;
```
