# @atcute/xrpc-server

## 2.0.3

### Patch Changes

- 8ec71bf: avoid per-frame microtask suspension when a WebSocket adapter sends synchronously.
- Updated dependencies [083f557]
  - @atcute/cbor@2.3.7

## 2.0.2

### Patch Changes

- 1d2baae: query parameters carrying no value are now treated as absent, falling back to the
  declared default.

  previously, `?limit=` coerced to `0`, and an omitted array parameter arrived as `[]`.

- 8ef3cff: integer query parameters must now be decimal notation, and are rejected otherwise.

  previously, `?limit=0x10` coerced to `16` and `?limit=1e2` to `100`.

- 529b718: `encoding` MIME wildcards like `image/*` and `*/*` now match instead of rejecting every
  request.
- Updated dependencies [9882a31]
- Updated dependencies [72fe990]
- Updated dependencies [cb01440]
- Updated dependencies [e988009]
- Updated dependencies [96c679b]
- Updated dependencies [f31de6d]
- Updated dependencies [8482323]
- Updated dependencies [7bcf27c]
- Updated dependencies [87f3666]
- Updated dependencies [89f5536]
- Updated dependencies [d18b465]
- Updated dependencies [06d2f55]
- Updated dependencies [9738798]
- Updated dependencies [ffea168]
- Updated dependencies [0e039ef]
- Updated dependencies [c0fde37]
- Updated dependencies [b72c247]
- Updated dependencies [ea64aa0]
  - @atcute/lexicons@2.0.3
  - @atcute/uint8array@1.1.5
  - @atcute/cbor@2.3.6
  - @atcute/identity@2.0.2
  - @atcute/multibase@1.2.5
  - @atcute/crypto@2.4.3

## 2.0.1

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/identity-resolver@2.0.1
  - @atcute/multibase@1.2.4
  - @atcute/identity@2.0.1
  - @atcute/lexicons@2.0.2
  - @atcute/crypto@2.4.2
  - @atcute/uint8array@1.1.3
  - @atcute/cbor@2.3.5

## 2.0.0

### Major Changes

- 8003cd0: drop the deprecated `XRPCRouter#add` overload set

  use `addQuery` and `addProcedure` directly.

  ```ts
  // before
  router.add('com.example.getThing', handler);

  // after
  router.addQuery('com.example.getThing', handler);
  router.addProcedure('com.example.doThing', handler);
  ```

### Patch Changes

- 72fe096: internal: migrate the JWT parser from `@badrap/valita` to `valibot`. no API change.
- Updated dependencies [f45af74]
- Updated dependencies [6aa06fb]
- Updated dependencies [1437627]
- Updated dependencies [8d4aebc]
- Updated dependencies [d64ddf1]
  - @atcute/identity@2.0.0
  - @atcute/identity-resolver@2.0.0
  - @atcute/lexicons@2.0.0

## 1.0.0

### Major Changes

- bd82378: service auth: align with atproto proposal 0014
  - `ServiceJwtVerifier` replaces `serviceDid: Did | null` with
    `acceptAudiences: (Did | AtprotoAudience)[] | null`, letting a service accept multiple audience
    values at once. this allows operators to accept both a bare DID and a DID-with-service-fragment
    during the ecosystem transition. `null` still means "accept any audience"; an empty array
    rejects every audience.
  - jwt `aud` now accepts a DID with service fragment (e.g. `did:web:x.example#svc`), not just a
    bare DID.
  - the `kid` jwt header now drives verification-method lookup in the issuer's DID document
    (defaulting to `#atproto` when absent). only `#atproto` is accepted for now, but the fragment is
    used to look up the key in the DID document rather than being hardcoded, so future support for
    additional verification methods is a non-breaking change.
  - `lxm` is now required both when signing (`createServiceJwt`) and when verifying (`verify`'s
    `options.lxm` is no longer nullable, and tokens without an `lxm` claim are rejected as
    malformed).

- d9a05fe: `WebSocketConnection` gains a required `drain(): void | Promise<void>` method. the router
  awaits it after every frame it sends so adapters can gate on the outgoing buffer. all four
  adapters now accept `highWaterMark` / `lowWaterMark` options (default 250 KB / 50 KB) on their
  factory functions and poll `bufferedAmount` to throttle the send loop; the Cloudflare Workers
  adapter no-ops because the runtime does not surface the outgoing buffer.

  without backpressure, a slow client on a high-throughput subscription (e.g. firehose) could
  balloon memory in the adapter's send queue.

- fa028bf: rename `XRPCError.description` to `.message` (and the same on `XRPCSubscriptionError`).
  response bodies continue to serialize as `{ error, message }`. the custom `InvalidHttpMethod`
  error code is replaced by the spec-standard `InvalidRequest`.
- 282f14f: split error observability: remove `handleSubscriptionException` (its default-throw
  behaviour caused unhandled rejections inside adapter async contexts). add fire-and-forget
  `onError` and `onSocketError` telemetry hooks that receive `{ error, request }`. both hooks skip
  client-induced errors (aborted requests, `XRPCError`, `XRPCSubscriptionError`), so they only fire
  for unexpected bugs.
- 14cacc7: accept `HEAD` requests on query routes. previously returned 405; now dispatches to the
  same handler as `GET` and lets the runtime strip the response body per the Fetch API.
- bdd2ed1: harden service JWT verification.
  - collapse `ServiceJwtVerifier.verify()` onto a single throwing method
    `verifyRequest(request, { lxm, signal? })`. it parses the `Authorization: Bearer` header,
    forwards the signal into DID resolution, and throws `AuthRequiredError` with a populated
    `WWW-Authenticate: Bearer` challenge on failure.
  - add `nbf` validation, `maxAge` bound (default 300s) on `exp`/`iat`, and `clockLeeway` (default
    5s) for `exp`/`nbf` comparisons.
  - add optional `replayStore` for nonce/replay protection. when set, tokens must carry a `jti` and
    the store is consulted with `{ iss, jti }` per verification.
  - align `AuthError.error` vocabulary with the atproto reference SDK: `BadJwt` (was
    `MalformedJwt`), `DidResolutionFailed` (was `UnresolvedDidDocument`), `InvalidAudience` (was
    `BadJwtAudience`), plus new `MissingBearer`, `JwtNotYetValid`, `JwtTooOld`, `NonceNotUnique`.

### Minor Changes

- 6b62a41: add `handleHealthCheck` router option. when set, `/xrpc/_health` dispatches to it; this
  endpoint is non-standard, so callers opt in and own the response body and status.
- 94d5ce8: export `formatWWWAuthenticate(challenge | challenges)` for building RFC 7235 challenge
  headers from `{ scheme, params?, token68? }`. `AuthRequiredError` gains a `wwwAuthenticate` option
  that auto-formats the header onto the response and appends
  `access-control-expose-headers: www-authenticate` so browsers can read it from CORS responses.

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/cbor@2.3.3
  - @atcute/identity@1.1.5
  - @atcute/identity-resolver@1.2.3
  - @atcute/lexicons@1.3.1

## 0.1.12

### Patch Changes

- 6aa8638: incorrect null check on serviceDid
- b909be5: use the correct key when revalidating

## 0.1.11

### Patch Changes

- 4e2306d: ignore body if content-length is 0

## 0.1.10

### Patch Changes

- b67d7b1: gracefully handle service jwt with extra fields

## 0.1.9

### Patch Changes

- 853514c: export operation types
- Updated dependencies [e73fddf]
- Updated dependencies [a60d862]
- Updated dependencies [2772033]
- Updated dependencies [f859da9]
  - @atcute/lexicons@1.2.7
  - @atcute/uint8array@1.1.0
  - @atcute/multibase@1.1.7

## 0.1.8

### Patch Changes

- 47d73b4: pass request signal to context

## 0.1.7

### Patch Changes

- dfae819: handle PNA requests in CORS middleware

## 0.1.6

### Patch Changes

- e3a71f2: allow passing headers into XRPCError

## 0.1.5

### Patch Changes

- 8bdfb88: CORS exclusion

## 0.1.4

### Patch Changes

- 3c4fcf3: standalone XRPC query/procedure handlers
- 65f4e74: handle namespace import

## 0.1.3

### Minor Changes

- 913bf06: XRPC subscriptions support
- 93bfccf: deprecate `router.add()` in favor of `.addQuery()` and `.addProcedure()` instead

### Patch Changes

- b07ccbb: clean up Valita schemas

## 0.1.2

### Patch Changes

- 1db9645: explicitly clarify `Uint8Array<ArrayBuffer>` for readJwtSignature
- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2
  - @atcute/identity-resolver@1.1.4
  - @atcute/uint8array@1.0.5
  - @atcute/multibase@1.1.6
  - @atcute/identity@1.1.1
  - @atcute/crypto@2.2.5

## 0.1.1

### Patch Changes

- cd5e492: only one parameter should be passed to middleware runner
