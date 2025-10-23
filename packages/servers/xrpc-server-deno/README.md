# @atcute/xrpc-server-deno

Deno WebSocket adapter for `@atcute/xrpc-server`.

```ts
import { XRPCRouter } from '@atcute/xrpc-server';
import { createDenoWebSocket } from '@atcute/xrpc-server-deno';

import { ComAtprotoSyncSubscribeRepos } from './lexicons/index.ts';

const adapter = createDenoWebSocket();
const router = new XRPCRouter({ websocket: adapter });

router.add(ComAtprotoSyncSubscribeRepos.mainSchema, {
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
