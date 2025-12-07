# @atcute/xrpc-server-bun

Bun WebSocket adapter for [`@atcute/xrpc-server`](../xrpc-server/).

```sh
npm install @atcute/xrpc-server-bun
```

see the [subscriptions section](../xrpc-server/#subscriptions) in the main package for usage details.

```ts
import { XRPCRouter } from '@atcute/xrpc-server';
import { createBunWebSocket } from '@atcute/xrpc-server-bun';

import { ComExampleSubscribe } from './lexicons/index.js';

const ws = createBunWebSocket();
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

export default ws.wrap(router);
```
