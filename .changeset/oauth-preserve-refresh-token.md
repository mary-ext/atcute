---
'@atcute/oauth-browser-client': patch
---

preserve the existing refresh token when a refresh response omits `refresh_token`, in compliance
with RFC 6749 §6.
