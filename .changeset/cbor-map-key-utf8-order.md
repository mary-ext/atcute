---
'@atcute/cbor': patch
---

sort map keys by their utf-8 bytes so maps with non-ascii keys encode and decode in canonical order,
rather than by utf-16 code units
