---
'@atcute/client': patch
---

improve retry logic in CredentialManager fetch handler:

- check if request was aborted before retrying
- compare tokens to detect if refresh actually happened
- cancel response body before retrying to prevent resource leaks
