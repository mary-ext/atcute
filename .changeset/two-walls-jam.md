---
'@atcute/oauth-browser-client': patch
---

store updatedAt value for DPoP nonces

we were checking against expiresAt, which was incorrect, the optimization check that'd defer
requests never actually went through.
