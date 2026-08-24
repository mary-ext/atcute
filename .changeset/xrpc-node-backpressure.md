---
'@atcute/xrpc-server-node': patch
---

avoid per-frame Promise allocation by sending synchronously and only waiting when WebSocket
backpressure is actually observed.
