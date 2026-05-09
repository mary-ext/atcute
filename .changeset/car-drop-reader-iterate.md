---
'@atcute/car': major
---

drop the deprecated `iterate()` method from `SyncCarReader`. iterate the reader directly with
`for..of`, or call `reader[Symbol.iterator]()` for a manual iterator.
