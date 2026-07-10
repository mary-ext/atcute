---
'@atcute/multibase': patch
---

fix `fromBase16` returning uninitialized memory on invalid or odd-length input instead of throwing,
on Node.js
