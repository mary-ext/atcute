# @atcute/oauth-browser-client

## 1.0.17

### Patch Changes

- Updated dependencies [9d05dfd]
- Updated dependencies [13f35e4]
- Updated dependencies [5aedfc5]
- Updated dependencies [a47373f]
- Updated dependencies [45cc699]
- Updated dependencies [2d10bd8]
- Updated dependencies [8aedcc5]
- Updated dependencies [45cfe46]
- Updated dependencies [813679f]
- Updated dependencies [24be9be]
- Updated dependencies [d3fbc7e]
- Updated dependencies [c7e8573]
- Updated dependencies [61bd8d2]
- Updated dependencies [87a99f1]
  - @atcute/client@3.0.0
  - @atcute/multibase@1.1.3

## 1.0.16

### Patch Changes

- e6d7ec5: use browser-native base64 serialization when possible

## 1.0.15

### Patch Changes

- a71c388: always return stale values from getWithLapsed

## 1.0.14

### Patch Changes

- 3cbf73e: store updatedAt value for DPoP nonces

  we were checking against expiresAt, which was incorrect, the optimization check that'd defer
  requests never actually went through.
