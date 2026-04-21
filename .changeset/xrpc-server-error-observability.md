---
'@atcute/xrpc-server': major
---

split error observability: remove `handleSubscriptionException` (its default-throw behaviour caused
unhandled rejections inside adapter async contexts). add fire-and-forget `onError` and
`onSocketError` telemetry hooks that receive `{ error, request }`. both hooks skip client-induced
errors (aborted requests, `XRPCError`, `XRPCSubscriptionError`), so they only fire for unexpected
bugs.
