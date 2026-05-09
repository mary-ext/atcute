---
'@atcute/xrpc-server': major
---

drop the deprecated `XRPCRouter#add` overload set

use `addQuery` and `addProcedure` directly.

```ts
// before
router.add('com.example.getThing', handler);

// after
router.addQuery('com.example.getThing', handler);
router.addProcedure('com.example.doThing', handler);
```
