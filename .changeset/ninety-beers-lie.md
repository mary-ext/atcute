---
'@atcute/car': major
---

remove AT Protocol repository reader

the addition of `@atcute/mst` into the atcute family of packages has put `@atcute/car` in a weird
spot, we can't have `@atcute/car` depend on `@atcute/mst` because we've already done the reverse to
test `@atcute/mst`'s functionalities.

if you need this functionality back, use `@atcute/repo`.

this does mean that we are skipping the stable release of v4, and straight into v5.
