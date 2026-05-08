---
'@atcute/lexicon-doc': major
---

migrate from `@badrap/valita` to `valibot`. the exported schemas (`lexiconDoc`, `lexBoolean`,
`lexString`, etc.) are now valibot schemas — instance methods `.parse(...)` and `.try(...)` no
longer exist; use `v.parse(schema, input)` and `v.safeParse(schema, input)` from valibot instead.
the result shape from `safeParse` is `{ success, output, issues }` rather than
`{ ok, value, issues }`, and issues no longer carry a `code` field.

every object in the schema graph is now a `looseObject`, so unknown fields are preserved by default;
this matches what every consumer in the workspace was already opting into via `mode: 'passthrough'`.
