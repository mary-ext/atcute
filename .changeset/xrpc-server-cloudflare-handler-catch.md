---
'@atcute/xrpc-server-cloudflare': patch
---

`createCloudflareWebSocket` now observes synchronous throws and unawaited rejections from the
subscription handler and closes the socket with code `1011` instead of leaking the error as an
unhandled rejection.
