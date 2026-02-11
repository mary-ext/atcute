---
'@atcute/cid': patch
---

remove toString caching

they weren't really useful as `toString()` are one-off calls usually
