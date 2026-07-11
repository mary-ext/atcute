---
'@atcute/identity': patch
---

fix verification material lookup ignoring relative fragment ids, so did documents with
`#atproto`-style verification method ids resolve their signing keys.
