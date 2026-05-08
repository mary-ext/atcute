---
'@atcute/lexicon-doc': major
---

migrate from `@badrap/valita` to `valibot`. exported schemas (`lexiconDoc`, `lexBoolean`,
`lexString`, etc.) are now valibot schemas — use `v.parse(schema, input)` /
`v.safeParse(schema, input)` instead of `.parse(...)` / `.try(...)`.
