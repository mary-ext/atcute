---
'@atcute/lexicons': minor
---

JIT-compiled object validation

this doesn't eek out as much performance as I hoped, but the added code was small enough that it
seemed okay to add.

this optimization requires the runtime environment to allow the use of `eval()`/`new Function()`,
and generates an unrolled validation loop.
