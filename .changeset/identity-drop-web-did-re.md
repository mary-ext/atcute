---
'@atcute/identity': major
---

drop the deprecated `WEB_DID_RE` and `ATPROTO_WEB_DID_RE` exports

use `isWebDid` / `isAtprotoWebDid` instead.

```ts
// before
WEB_DID_RE.test(input);
ATPROTO_WEB_DID_RE.test(input);

// after
isWebDid(input);
isAtprotoWebDid(input);
```
