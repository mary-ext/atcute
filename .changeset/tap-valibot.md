---
'@atcute/tap': major
---

migrate from `@badrap/valita` to `valibot`. exported `repoInfoSchema`, `tapEventWireSchema`,
`tapRecordEventWireSchema`, and `tapIdentityEventWireSchema` are now valibot schemas — use
`v.parse(schema, input)` / `v.safeParse(schema, input)` instead of `.parse(...)` / `.try(...)`.
