---
'@atcute/varint': major
---

alter the return shape of `decode()`

`decode()` now returns `{ value, nextOffset }` instead of `[value, nextOffset]`, on Bun this seems
to make a noticeable improvement.
