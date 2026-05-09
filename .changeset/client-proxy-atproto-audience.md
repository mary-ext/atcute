---
'@atcute/client': major
---

replace `Client`'s `proxy` option object with an `AtprotoAudience` string

the `ServiceProxyOptions` type is gone.

```ts
// before
new Client({ handler, proxy: { did: 'did:web:api.bsky.chat', serviceId: '#bsky_chat' } });

// after
new Client({ handler, proxy: 'did:web:api.bsky.chat#bsky_chat' });
```
