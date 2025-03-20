---
'@atcute/car': major
---

return offsets for CAR headers

CAR reader will now return start and end ranges for the header. Breaking change as we're no longer
returning `roots` directly.
