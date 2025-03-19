---
'@atcute/car': minor
---

yield positions of each CAR entries

`entryStart`, `entrySize`, `cidStart`, and `bytesStart` are now yielded by `readCar` function,
making it possible to seek to a certain offset at a later time.
