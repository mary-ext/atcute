---
'@atcute/identity': major
---

drop the deprecated `PLC_DID_RE` export

use `isPlcDid` instead.

```ts
// before
PLC_DID_RE.test(input);

// after
isPlcDid(input);
```
