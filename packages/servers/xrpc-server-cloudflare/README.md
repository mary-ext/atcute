# @atcute/xrpc-server-cloudflare

Cloudflare Workers WebSocket adapter for `@atcute/xrpc-server`.

```sh
npm install @atcute/xrpc-server-cloudflare
```

```ts
import { XRPCRouter } from '@atcute/xrpc-server';
import { createCloudflareWebSocket } from '@atcute/xrpc-server-cloudflare';

import { ComAtprotoSyncSubscribeRepos } from './lexicons/index.js';

const adapter = createCloudflareWebSocket();
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

export default router satisfies ExportedHandler;
```
