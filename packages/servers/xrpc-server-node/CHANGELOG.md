# @atcute/xrpc-server-node

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
