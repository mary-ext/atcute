---
'@atcute/xrpc-server': patch
---

query parameters carrying no value are now treated as absent, falling back to the declared default.

previously, `?limit=` coerced to `0`, and an omitted array parameter arrived as `[]`.
