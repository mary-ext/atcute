---
'@atcute/oauth-types': major
'@atcute/oauth-crypto': major
'@atcute/oauth-node-client': patch
---

migrate the OAuth packages from `@badrap/valita` to `valibot`. every exported schema (the entire
`schemas/` directory in `@atcute/oauth-types`, plus `dpop`'s internal validators) is now a valibot
schema — instance methods `.parse(...)` and `.try(...)` no longer exist; use
`v.parse(schema, input)` / `v.safeParse(schema, input)` from valibot.

every object in the schema graph is `looseObject`, matching the `mode: 'passthrough'` already in use
at every call site. duplicate-detection error messages on the OAuth scope schemas no longer include
the duplicate value (the validation logic is unchanged).

ride-along call site updates in `@atcute/oauth-node-client`.
