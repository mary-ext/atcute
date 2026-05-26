---
'@atcute/xrpc-server-node': patch
---

`injectWebSocket` no longer claims non-`/xrpc/*` upgrade requests, letting other listeners on the
same server (e.g. Vite HMR, in-app WebSocket routes) handle them.
