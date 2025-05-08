---
'@atcute/client': major
---

the old `XRPC` interface for making API requests has been removed

you'd need to migrate to the new `Client` interface

```ts
const client = new Client({
	handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
});

const data = await ok(
	client.get('app.bsky.actor.getProfile', {
		params: {
			actor: 'bsky.app',
		},
	}),
);

console.log(data.displayName);
// -> Bluesky
```
