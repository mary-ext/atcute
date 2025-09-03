---
'@atcute/crypto': patch
---

`P256PublicKey.importRaw(publicKey)` no longer throws cryptic errors when importing compressed P256
keys on Firefox and Safari.

note that `P256PrivateKey.importRaw(privateKey)` will still throw cryptic errors on Firefox, this is
not something that can be remedied on this side. either wait for Firefox 143 stable release or
manually pass a public key as the second argument.
