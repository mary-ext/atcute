# @atcute/oauth-node-client

## 0.1.2

### Patch Changes

- d206199: remove unnecessary in-memory lock

  SessionGetter has no need to pull in a default lock function for single-process usage,
  CachedGetter already provides guarantee that only one session restoration can happen at a time for
  a given DID.

## 0.1.1

### Patch Changes

- 937b6a3: do not check if jwks_uri is same-origin
