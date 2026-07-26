---
'@atcute/oauth-browser-client': minor
---

add `staleAccessToken` option to `SessionGetOptions`, ensuring 401 `invalid_token` retries perform a
token refresh when the cached access token matches the rejected token.
