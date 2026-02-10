---
'@atcute/varint': minor
---

allow passing offset and length to `decode()`

`decode()` now allows specifying the offset to read from, removing the need to subarray/slice the
buffer before passing to the decoder.
