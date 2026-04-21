---
'@atcute/xrpc-server': major
'@atcute/xrpc-server-bun': major
'@atcute/xrpc-server-cloudflare': major
'@atcute/xrpc-server-deno': major
'@atcute/xrpc-server-node': major
---

`WebSocketConnection` gains a required `drain(): void | Promise<void>` method. the router awaits it
after every frame it sends so adapters can gate on the outgoing buffer. all four adapters now accept
`highWaterMark` / `lowWaterMark` options (default 250 KB / 50 KB) on their factory functions and
poll `bufferedAmount` to throttle the send loop; the Cloudflare Workers adapter no-ops because the
runtime does not surface the outgoing buffer.

without backpressure, a slow client on a high-throughput subscription (e.g. firehose) could balloon
memory in the adapter's send queue.
