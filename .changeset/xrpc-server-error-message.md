---
'@atcute/xrpc-server': major
---

rename `XRPCError.description` to `.message` (and the same on `XRPCSubscriptionError`). response
bodies continue to serialize as `{ error, message }`. the custom `InvalidHttpMethod` error code is
replaced by the spec-standard `InvalidRequest`.
