---
'@atcute/oauth-browser-client': patch
---

handle `invalid_grant` errors during token refresh by checking if another document rotated the token
concurrently.
