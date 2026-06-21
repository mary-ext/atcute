---
'@atcute/util-text': patch
'@atcute/util-text-native': patch
---

extend the exact-count fast path from ASCII to Latin-1, so grapheme length checks on precomposed
accented text skip segmentation
