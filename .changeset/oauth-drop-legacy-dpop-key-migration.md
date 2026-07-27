---
'@atcute/oauth-browser-client': major
---

drop the automatic migration of pre-3.0.0 DPoP keys

sessions still holding the legacy key format now fail on use, and their users have to sign in again.
