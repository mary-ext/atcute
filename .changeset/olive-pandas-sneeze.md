---
'@atcute/uint8array': patch
---

fix `getUtf8Length` and `isUtf8LengthInRange` miscounting unpaired surrogates, on runtimes other
than Node.js and Bun
