# @atcute/xrpc-server-bun

Bun WebSocket adapter for `@atcute/xrpc-server`.

```sh
npm install @atcute/xrpc-server-bun
```

```ts
import { XRPCRouter } from '@atcute/xrpc-server';
import { createBunWebSocket } from '@atcute/xrpc-server-bun';

import { ComAtprotoSyncSubscribeRepos } from './lexicons/index.js';

const { adapter, wrap } = createBunWebSocket();
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

export default router satisfies Bun.Serve;
```
