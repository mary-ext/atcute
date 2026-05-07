---
'@atcute/util-fetch': major
---

drop the temporary `@badrap/valita` bridge from `validateJsonWith` — every workspace consumer has
migrated to valibot. the helper now only accepts `valibot` schemas (`v.GenericSchema<unknown, T>`);
call sites that still passed `{ mode: 'passthrough' }` should drop the second argument and encode
passthrough behavior into the schema with `v.looseObject` if needed.

the `dohJsonTxtResult` schema is now valibot — `.parse(...)` is gone; use `v.parse(schema, input)` /
`v.safeParse(schema, input)` from valibot instead.
