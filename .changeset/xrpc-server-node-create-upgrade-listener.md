---
'@atcute/xrpc-server-node': minor
---

add `createUpgradeListener(router)` on `NodeWebSocket`. it returns the bare `'upgrade'` listener
without attaching it to a server, so callers can wrap its invocation in their own context (e.g.
running it inside an `AsyncLocalStorage.run`) before delegating.
