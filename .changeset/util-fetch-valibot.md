---
'@atcute/util-fetch': major
---

migrate from `@badrap/valita` to `valibot`. `validateJsonWith` now takes a valibot schema
(`v.GenericSchema<unknown, T>`) and the `mode` options argument is gone — encode passthrough into
the schema with `v.looseObject` if needed.

the exported `dohJsonTxtResult` schema is also valibot now — use `v.parse(schema, input)` /
`v.safeParse(schema, input)` instead of `.parse(...)` / `.try(...)`.
