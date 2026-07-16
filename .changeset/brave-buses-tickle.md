---
'@atcute/uint8array': patch
'@atcute/cbor': patch
---

`decodeUtf8From` now throws on malformed UTF-8 instead of substituting U+FFFD.
