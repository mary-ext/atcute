# @atcute/xrpc-server-deno

Deno WebSocket adapter for [`@atcute/xrpc-server`](../xrpc-server/).

```sh
deno add jsr:@aspect/xrpc-server-deno
```

see the [subscriptions section](../xrpc-server/#subscriptions) in the main package for usage details.

```ts
import { XRPCRouter } from '@atcute/xrpc-server';
import { createDenoWebSocket } from '@atcute/xrpc-server-deno';

import { ComExampleSubscribe } from './lexicons/index.ts';

const adapter = createDenoWebSocket();
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

export default router satisfies Deno.ServeDefaultExport;
```
