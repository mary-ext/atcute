# @atcute/oauth-types

OAuth types and schemas for AT Protocol.

## installation

```sh
npm install @atcute/oauth-types
```

## usage

### building client metadata

```ts
import { buildClientMetadata } from '@atcute/oauth-types';
import { Keyset } from '@atcute/oauth-keyset';

const metadata = buildClientMetadata(
	{
		client_id: 'https://example.com/client-metadata.json',
		redirect_uris: ['https://example.com/callback'],
		scope: 'atproto transition:generic',
		client_name: 'my app',
	},
	keyset,
);
```

### using schemas

```ts
import {
	confidentialClientMetadataSchema,
	oauthClientMetadataSchema,
	oauthTokenResponseSchema,
	oauthAuthorizationServerMetadataSchema,
} from '@atcute/oauth-types';

// validate input
const result = confidentialClientMetadataSchema.try(input);
if (result.ok) {
	console.log(result.value);
}
```

## exports

- `buildClientMetadata` - builds atproto client metadata from configuration
- `FALLBACK_ALG` - default algorithm per atproto spec ('ES256')
- `CLIENT_ASSERTION_TYPE_JWT_BEARER` - JWT bearer assertion type

### schemas

**client metadata:**

- `confidentialClientMetadataSchema` - user-facing metadata input
- `oauthClientMetadataSchema` - full OAuth client metadata

**tokens:**

- `oauthTokenResponseSchema` - OAuth token response
- `oauthTokenTypeSchema` - token type (Bearer, DPoP)
- `atprotoOAuthTokenResponseSchema` - AT Protocol token response

**authorization server:**

- `oauthAuthorizationServerMetadataSchema` - OAuth AS metadata
- `atprotoAuthorizationServerMetadataSchema` - AT Protocol AS metadata
- `oauthIssuerIdentifierSchema` - issuer identifier

**protected resource:**

- `oauthProtectedResourceMetadataSchema` - OAuth PRM
- `atprotoProtectedResourceMetadataSchema` - AT Protocol PRM

**PAR:**

- `oauthParResponseSchema` - PAR response
- `oauthCodeChallengeMethodSchema` - code challenge method (S256, plain)
- `oauthResponseModeSchema` - response mode

**authorization:**

- `oauthAuthorizationDetailsSchema` - authorization details

**keys:**

- `jwkSchema`, `jwkPubSchema` - JWK schemas
- `jwksSchema`, `jwksPubSchema` - JWKS schemas

**URIs:**

- `urlSchema`, `httpsUriSchema`, `webUriSchema`, etc.

**other:**

- `oauthScopeSchema`, `oauthGrantTypeSchema`, etc.

## license

0BSD
