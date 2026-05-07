---
'@atcute/util-fetch': patch
---

`validateJsonWith` now accepts either a `@badrap/valita` schema or a `valibot` schema. this is a
temporary bridge while the rest of the workspace migrates from valita to valibot — once every
consumer has migrated, valita support will be dropped.

the valita overload preserves the existing `mode: 'passthrough' | 'strip' | 'strict'` option;
valibot has no call-time mode equivalent so callers passing valibot schemas should encode the mode
into the schema itself (e.g. `v.looseObject(...)` for passthrough behavior).
