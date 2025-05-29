---
'@atcute/identity-resolver': patch
---

use `manual` redirect instead of `error`

apparently Cloudflare Workers doesn't think it makes sense for edge runtimes to support it, but how
exactly? who knows.

```
TypeError: Invalid redirect value, must be one of "follow" or "manual" ("error" won't be implemented since it does not make sense at the edge; use "manual" and check the response status code).
```
