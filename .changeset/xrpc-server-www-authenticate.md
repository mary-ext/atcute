---
'@atcute/xrpc-server': minor
---

export `formatWWWAuthenticate(challenge | challenges)` for building RFC 7235 challenge headers from
`{ scheme, params?, token68? }`. `AuthRequiredError` gains a `wwwAuthenticate` option that
auto-formats the header onto the response and appends
`access-control-expose-headers: www-authenticate` so browsers can read it from CORS responses.
