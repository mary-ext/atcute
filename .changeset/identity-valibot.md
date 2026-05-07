---
'@atcute/identity': major
'@atcute/identity-resolver': major
'@atcute/tap': patch
'@atcute/did-plc': patch
---

migrate `@atcute/identity` and `@atcute/identity-resolver` from `@badrap/valita` to `valibot`. the
exported `defs.didDocument`, `defs.verificationMethod`, `defs.service`, `defs.didString`, and
related schemas are now valibot schemas — instance methods `.parse(...)` and `.try(...)` no longer
exist; use `v.parse(schema, input)` / `v.safeParse(schema, input)` from valibot.

every object in the schema graph is `looseObject`, matching the `mode: 'passthrough'` that every
in-workspace consumer was already using. the duplicate-detection error messages on `alsoKnownAs`,
`verificationMethod`, and `service` no longer include the duplicate value or the array index in
the issue path; the validation logic is unchanged.

ride-along call site updates in `@atcute/tap` (which directly parses `defs.didDocument`) and
`@atcute/did-plc` (which now passes the valibot `defs.didDocument` through the bridged
`validateJsonWith`).
