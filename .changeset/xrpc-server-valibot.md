---
'@atcute/xrpc-server': patch
---

migrate the JWT parser from `@badrap/valita` to `valibot`. internal change only — `parseJwt` and the
exported `JwtHeader` / `JwtPayload` / `ParsedJwt` types are unchanged.
