---
'@atcute/xrpc-server': major
---

harden service JWT verification.

- collapse `ServiceJwtVerifier.verify()` onto a single throwing method
  `verifyRequest(request, { lxm, signal? })`. it parses the `Authorization: Bearer` header, forwards
  the signal into DID resolution, and throws `AuthRequiredError` with a populated
  `WWW-Authenticate: Bearer` challenge on failure.
- add `nbf` validation, `maxAge` bound (default 300s) on `exp`/`iat`, and `clockLeeway` (default 5s)
  for `exp`/`nbf` comparisons.
- add optional `replayStore` for nonce/replay protection. when set, tokens must carry a `jti` and
  the store is consulted with `{ iss, jti }` per verification.
- align `AuthError.error` vocabulary with the atproto reference SDK: `BadJwt` (was `MalformedJwt`),
  `DidResolutionFailed` (was `UnresolvedDidDocument`), `InvalidAudience` (was `BadJwtAudience`),
  plus new `MissingBearer`, `JwtNotYetValid`, `JwtTooOld`, `NonceNotUnique`.
