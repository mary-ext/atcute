---
'@atcute/client': patch
---

add concurrent session protection in CredentialManager:

- protect against concurrent `resume()` of the same session
- detect concurrent session updates in `#refreshSessionInner()`
- clear `#refreshSessionPromise` before login to prevent stale refreshes
