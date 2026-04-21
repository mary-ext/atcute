---
'@atcute/xrpc-server': major
---

service auth: align with atproto proposal 0014

- `ServiceJwtVerifier` replaces `serviceDid: Did | null` with
  `acceptAudiences: (Did | AtprotoAudience)[] | null`, letting a service accept multiple audience
  values at once. this allows operators to accept both a bare DID and a DID-with-service-fragment
  during the ecosystem transition. `null` still means "accept any audience"; an empty array rejects
  every audience.
- jwt `aud` now accepts a DID with service fragment (e.g. `did:web:x.example#svc`), not just a bare
  DID.
- the `kid` jwt header now drives verification-method lookup in the issuer's DID document
  (defaulting to `#atproto` when absent). only `#atproto` is accepted for now, but the fragment is
  used to look up the key in the DID document rather than being hardcoded, so future support for
  additional verification methods is a non-breaking change.
- `lxm` is now required both when signing (`createServiceJwt`) and when verifying (`verify`'s
  `options.lxm` is no longer nullable, and tokens without an `lxm` claim are rejected as malformed).
