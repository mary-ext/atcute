---
'@atcute/did-plc': major
---

migrate from `@badrap/valita` to `valibot`. exported schemas (`operation`, `tombstone`,
`operationLog`, `indexedEntryLog`, `plcState`, `compatibleOperation`, etc.) are now valibot schemas
— use `v.parse(schema, input)` / `v.safeParse(schema, input)` instead of `.parse(...)` /
`.try(...)`.
