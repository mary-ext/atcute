---
'@atcute/jetstream': major
---

migrate from `@badrap/valita` to `valibot`. the exported event schemas (`jetstreamEventSchema`,
`commitEventSchema`, etc.) are now valibot schemas — instance methods `.parse(...)` and `.try(...)`
no longer exist; use `v.parse(schema, input)` / `v.safeParse(schema, input)` from valibot.

every object in the schema graph is `looseObject`, matching the `mode: 'passthrough'` already in use
at every call site.
