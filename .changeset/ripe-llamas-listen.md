---
'@atcute/oauth-node-client': patch
---

remove unnecessary in-memory lock

SessionGetter has no need to pull in a default lock function for single-process usage, CachedGetter
already provides guarantee that only one session restoration can happen at a time for a given DID.
