---
'@atcute/lex-cli': patch
---

write pulled lexicons in canonical key order

`lex-cli pull` now sorts keys into dag-cbor canonical order (shorter keys first, then lexicographic)
so output stays deterministic regardless of schema field declaration order.
