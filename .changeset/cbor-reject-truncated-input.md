---
'@atcute/cbor': patch
---

reject truncated and out-of-bounds input when decoding, instead of silently returning partial values
or pre-allocating an array larger than the remaining input
