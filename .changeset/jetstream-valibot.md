---
'@atcute/jetstream': major
---

migrate from `@badrap/valita` to `valibot`. exported event schemas (`jetstreamEventSchema`,
`commitEventSchema`, etc.) are now valibot schemas — use `v.parse(schema, input)` /
`v.safeParse(schema, input)` instead of `.parse(...)` / `.try(...)`.
