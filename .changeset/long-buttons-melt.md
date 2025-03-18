---
'@atcute/cid': patch
---

skip using varint for CID codec

we are dealing with DASL CIDv1, and we only support SHA-256. the length of a CID is guaranteed to be
36 bytes, with 4 bytes for header and 32 bytes for digest contents.
