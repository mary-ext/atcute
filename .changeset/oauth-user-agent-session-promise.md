---
'@atcute/oauth-browser-client': patch
---

`OAuthUserAgent#getSession` now clears only its own pending refresh promise.
