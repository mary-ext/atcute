---
'@atcute/client': major
---

`Client`'s `proxy` option is now an `AtprotoAudience` string (e.g.
`'did:web:api.bsky.chat#bsky_chat'`) instead of a `{ did, serviceId }` object. the
`ServiceProxyOptions` type is gone.
