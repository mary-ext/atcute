---
'@atcute/xrpc-server-deno': patch
---

pass an `Error` to `controller.abort()` on socket close. `signal.reason` is now an `Error`, matching
the bun and node adapters.
