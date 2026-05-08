---
'@atcute/identity': major
'@atcute/identity-resolver': major
---

migrate from `@badrap/valita` to `valibot`. exported schemas (`defs.didDocument`,
`defs.verificationMethod`, `defs.service`, `defs.didString`, etc.) are now valibot schemas — use
`v.parse(schema, input)` / `v.safeParse(schema, input)` instead of `.parse(...)` / `.try(...)`.
