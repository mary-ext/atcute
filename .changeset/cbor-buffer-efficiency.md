---
'@atcute/cbor': patch
---

reduce CBOR allocation and retained memory for large values, and avoid quadratic canonical key
sorting on wide maps. decoded CIDs and small byte strings no longer retain disproportionately large
input buffers, while large byte strings remain zero-copy.
