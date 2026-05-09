---
'@atcute/jetstream': minor
---

add an `onError` option

validation failures (a valibot `ValiError`) are now passed to `onError` instead of being silently
dropped.

```ts
new JetstreamSubscription({
	onError: (err) => {
		// `err` is a `ValiError` for validation failures
	},
});
```

`updateOptions` no longer reconnects when only `cursor` is passed and matches the current cursor.
filter-only updates still go in-band; cursor changes or other option changes still reconnect.
