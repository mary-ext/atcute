---
'@atcute/crypto': patch
---

fix `exportPrivateKey()` throwing a `RangeError` for keys created via `importRaw()`, affecting p256
everywhere and secp256k1 on Node.js
