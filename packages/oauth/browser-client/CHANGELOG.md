# @atcute/oauth-browser-client

## 1.0.27

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2
  - @atcute/uint8array@1.0.5
  - @atcute/multibase@1.1.6
  - @atcute/identity@1.1.1
  - @atcute/client@4.0.4

## 1.0.26

### Patch Changes

- 691f5cc: remove `iss` field from dpop jwt tokens
- 1fd2796: remove redundant check before request instantiation
- 9870d55: check if retried request returns a new nonce

  in case the authorization server is set up to always return a new nonce every request.

- Updated dependencies [2fe5658]
- Updated dependencies [c1582e0]
  - @atcute/identity@1.0.3
  - @atcute/client@4.0.4

## 1.0.25

### Patch Changes

- 6dcb891: increase random string length for PKCE challenge

## 1.0.24

### Patch Changes

- 83c069d: use nanoid again for random string generation
- Updated dependencies [0e6e5eb]
- Updated dependencies [a2dbb16]
- Updated dependencies [9ef363f]
  - @atcute/uint8array@1.0.3
  - @atcute/lexicons@1.0.4
  - @atcute/multibase@1.1.5
  - @atcute/client@4.0.4
  - @atcute/identity@1.0.3

## 1.0.23

### Patch Changes

- Updated dependencies [bd446e4]
  - @atcute/client@4.0.3

## 1.0.22

### Patch Changes

- a3f9e9b: only include URL origin and pathname in `htu` when signing DPoP requests

## 1.0.21

### Patch Changes

- Updated dependencies [61b0fd1]
  - @atcute/lexicons@1.0.2
  - @atcute/client@4.0.2
  - @atcute/identity@1.0.2

## 1.0.20

### Patch Changes

- Updated dependencies [ede65cf]
- Updated dependencies [6abad75]
- Updated dependencies [5310da3]
- Updated dependencies [3125bf6]
- Updated dependencies [5ec9a3c]
- Updated dependencies [69db9c7]
  - @atcute/uint8array@1.0.2
  - @atcute/lexicons@1.0.1
  - @atcute/multibase@1.1.4
  - @atcute/client@4.0.1
  - @atcute/identity@1.0.1

## 1.0.19

### Patch Changes

- Updated dependencies [551c67a]
- Updated dependencies [d02554d]
- Updated dependencies [d02554d]
  - @atcute/identity@1.0.0
  - @atcute/client@4.0.0

## 1.0.18

### Patch Changes

- Updated dependencies [49028fb]
  - @atcute/client@3.1.0

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
