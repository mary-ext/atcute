---
'@atcute/xrpc-server': patch
---

integer query parameters must now be decimal notation, and are rejected otherwise.

previously, `?limit=0x10` coerced to `16` and `?limit=1e2` to `100`.
