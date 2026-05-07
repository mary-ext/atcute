---
'@atcute/tap': major
---

migrate from `@badrap/valita` to `valibot`. the exported `repoInfoSchema`, `tapEventWireSchema`,
`tapRecordEventWireSchema`, and `tapIdentityEventWireSchema` are now valibot schemas — instance
methods `.parse(...)` and `.try(...)` no longer exist; use `v.parse(schema, input)` /
`v.safeParse(schema, input)` from valibot.

every object in the schema graph is `looseObject`, matching the `mode: 'passthrough'` already in use
at every call site.
