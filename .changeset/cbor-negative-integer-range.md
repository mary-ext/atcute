---
'@atcute/cbor': patch
---

reject decoding the negative integer one past the safe-integer range (-(2^53)), which the encoder
could not round-trip
