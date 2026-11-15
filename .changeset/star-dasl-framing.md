---
'@atcute/star': minor
---

update codec to match the current DASL STAR specification

- add `0x01` pair markers and `0x00` terminal byte, rejecting truncated archives and trailing data
- raise varint limit to 9 bytes and remove format-level size limits on the writer
- add `maxMetaLength` reader option and lower default reader limits (`5 MiB` meta/value, `8 KiB`
  key)
