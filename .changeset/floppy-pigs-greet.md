---
'@atcute/car': minor
---

yield positions of each CAR entries

`entryStart`, `entryEnd`, `cidStart`, `cidEnd`, `bytesStart` and `bytesEnd` are now yielded by
`readCar` function, making it possible to seek to a certain offset at a later time.
