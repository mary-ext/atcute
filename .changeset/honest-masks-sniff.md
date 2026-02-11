---
'@atcute/uint8array': patch
---

avoid calling `buf.subarray()` in `decodeUtf8From()` unless necessary on browser runtime
