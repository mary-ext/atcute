---
'@atcute/password-session': patch
---

network failures during token refresh are now treated as transient, preserving the session for
retry.
