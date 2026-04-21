---
'@atcute/xrpc-server': minor
---

add `handleHealthCheck` router option. when set, `/xrpc/_health` dispatches to it; this endpoint is
non-standard, so callers opt in and own the response body and status.
