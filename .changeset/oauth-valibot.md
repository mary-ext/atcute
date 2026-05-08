---
'@atcute/oauth-types': major
'@atcute/oauth-crypto': major
---

migrate from `@badrap/valita` to `valibot`. every exported schema (the `schemas/` directory in
`@atcute/oauth-types`, plus `dpop`'s validators) is now a valibot schema — use
`v.parse(schema, input)` / `v.safeParse(schema, input)` instead of `.parse(...)` / `.try(...)`.
