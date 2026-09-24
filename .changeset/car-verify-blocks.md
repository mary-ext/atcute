---
'@atcute/car': minor
---

verify blocks against their CIDs when reading, throwing `CarBlockMismatchError` on a mismatch.

pass `{ verifyBlocks: false }` to skip verification; use `verifyBlock()` to check individual blocks
