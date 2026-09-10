# @atcute/xrpc-server-node

## 2.1.2

### Patch Changes

- f05b92f: avoid per-frame Promise allocation by sending synchronously and only waiting when
  WebSocket backpressure is actually observed.

## 2.1.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish

## 2.1.0

### Minor Changes

- 894ab08: add `createUpgradeListener(router)` on `NodeWebSocket`. it returns the bare `'upgrade'`
  listener without attaching it to a server, so callers can wrap its invocation in their own context
  (e.g. running it inside an `AsyncLocalStorage.run`) before delegating.

### Patch Changes

- 4c66188: `injectWebSocket` no longer claims non-`/xrpc/*` upgrade requests, letting other
  listeners on the same server (e.g. Vite HMR, in-app WebSocket routes) handle them.

## 2.0.0

### Patch Changes

- Updated dependencies [8003cd0]
- Updated dependencies [72fe096]
  - @atcute/xrpc-server@2.0.0

## 1.0.0

### Major Changes

- d9a05fe: `WebSocketConnection` gains a required `drain(): void | Promise<void>` method. the router
  awaits it after every frame it sends so adapters can gate on the outgoing buffer. all four
  adapters now accept `highWaterMark` / `lowWaterMark` options (default 250 KB / 50 KB) on their
  factory functions and poll `bufferedAmount` to throttle the send loop; the Cloudflare Workers
  adapter no-ops because the runtime does not surface the outgoing buffer.

  without backpressure, a slow client on a high-throughput subscription (e.g. firehose) could
  balloon memory in the adapter's send queue.

### Patch Changes

- Updated dependencies [bd82378]
- Updated dependencies [d174298]
- Updated dependencies [d9a05fe]
- Updated dependencies [fa028bf]
- Updated dependencies [282f14f]
- Updated dependencies [14cacc7]
- Updated dependencies [6b62a41]
- Updated dependencies [bdd2ed1]
- Updated dependencies [94d5ce8]
  - @atcute/xrpc-server@1.0.0

## 0.1.1

### Patch Changes

- 82728cf: incorrect exports
