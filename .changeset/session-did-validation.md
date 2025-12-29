---
'@atcute/client': patch
---

add DID validation in CredentialManager:

- detect DID mismatch during token refresh
- validate JWT `sub` claims match session DID on resume
