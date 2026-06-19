---
'@atcute/xrpc-server': minor
'@atcute/xrpc-server-bun': minor
'@atcute/xrpc-server-cloudflare': minor
'@atcute/xrpc-server-deno': minor
'@atcute/xrpc-server-node': minor
---

serve the `xrpc.v1.json` and `xrpc.v1.cbor` event-stream encodings, negotiated via
`Sec-WebSocket-Protocol`; the unnegotiated default remains `xrpc.v0.cbor` and can be overridden per
subscription
