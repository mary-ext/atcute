---
'@atcute/xrpc-server': major
---

accept `HEAD` requests on query routes. previously returned 405; now dispatches to the same handler
as `GET` and lets the runtime strip the response body per the Fetch API.
