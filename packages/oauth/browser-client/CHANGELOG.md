# @atcute/oauth-browser-client

## 1.0.15

### Patch Changes

- a71c388: always return stale values from getWithLapsed

## 1.0.14

### Patch Changes

- 3cbf73e: store updatedAt value for DPoP nonces

  we were checking against expiresAt, which was incorrect, the optimization check that'd defer
  requests never actually went through.
