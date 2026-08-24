---
'@atcute/tap': patch
---

flush buffered acknowledgements in linear time after reconnecting instead of copying the remaining
queue for every acknowledgement.
