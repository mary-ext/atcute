---
'@atcute/cid': minor
'@atcute/car': minor
'@atcute/cbor': minor
---

update to DASL spec 2025-10-20

- remove support for empty CIDs (zero-length digests), which were removed from the spec
- reject `Infinity` values in CBOR encoder (in addition to `NaN`)
- optimize streamed CAR reader by removing buffer concatenation for CID reads
