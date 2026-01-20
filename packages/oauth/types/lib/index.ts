export { buildClientMetadata } from './build-client-metadata.js';
export { CLIENT_ASSERTION_TYPE_JWT_BEARER, FALLBACK_ALG } from './constants.js';

export * as scope from './scope.js';

// schemas
export {
	confidentialClientMetadataSchema,
	type ConfidentialClientMetadata,
} from './schemas/atcute-confidential-client-metadata.js';
export {
	atprotoOAuthScopeSchema,
	ATPROTO_SCOPE_VALUE,
	DEFAULT_ATPROTO_OAUTH_SCOPE,
	type AtprotoOAuthScope,
} from './schemas/atproto-oauth-scope.js';
export {
	jwkPubSchema,
	jwkSchema,
	keyUsageSchema,
	publicKeyUsageSchema,
	type Jwk,
	type JwkPub,
	type KeyUsage,
} from './schemas/jwk.js';
export { jwksPubSchema, jwksSchema, type Jwks, type JwksPub } from './schemas/jwks.js';
export { oauthClientIdDiscoverableSchema } from './schemas/oauth-client-id-discoverable.js';
export { oauthClientIdSchema, type OAuthClientId } from './schemas/oauth-client-id.js';
export { oauthClientMetadataSchema, type OAuthClientMetadata } from './schemas/oauth-client-metadata.js';
export {
	oauthEndpointAuthMethodSchema,
	type OAuthEndpointAuthMethod,
} from './schemas/oauth-endpoint-auth-method.js';
export { oauthGrantTypeSchema, type OAuthGrantType } from './schemas/oauth-grant-type.js';
export {
	loopbackRedirectUriSchema,
	oauthRedirectUriSchema,
	type LoopbackRedirectUri,
	type OAuthRedirectUri,
} from './schemas/oauth-redirect-uri.js';
export { oauthResponseTypeSchema, type OAuthResponseType } from './schemas/oauth-response-type.js';
export {
	isOAuthScope,
	OAUTH_SCOPE_REGEXP,
	oauthScopeSchema,
	type OAuthScope,
} from './schemas/oauth-scope.js';
export {
	httpsUriSchema,
	loopbackUriSchema,
	nonLocalWebUriSchema,
	privateUseUriSchema,
	urlSchema,
	webUriSchema,
} from './schemas/uri.js';
export {
	extractUrlPath,
	isHostnameIP,
	isLastOccurrence,
	isLocalHostname,
	isLoopbackHost,
	isSpaceSeparatedValue,
} from './schemas/utils.js';

// token schemas
export { oauthTokenTypeSchema, type OAuthTokenType } from './schemas/oauth-token-type.js';
export { oauthTokenResponseSchema, type OAuthTokenResponse } from './schemas/oauth-token-response.js';
export {
	atprotoOAuthTokenResponseSchema,
	type AtprotoOAuthTokenResponse,
} from './schemas/atproto-oauth-token-response.js';

// PAR schemas
export { oauthParResponseSchema, type OAuthParResponse } from './schemas/oauth-par-response.js';
export {
	oauthCodeChallengeMethodSchema,
	type OAuthCodeChallengeMethod,
} from './schemas/oauth-code-challenge-method.js';
export { oauthResponseModeSchema, type OAuthResponseMode } from './schemas/oauth-response-mode.js';

// authorization details
export {
	oauthAuthorizationDetailSchema,
	oauthAuthorizationDetailsSchema,
	type OAuthAuthorizationDetail,
	type OAuthAuthorizationDetails,
} from './schemas/oauth-authorization-details.js';

// server metadata
export {
	oauthIssuerIdentifierSchema,
	type OAuthIssuerIdentifier,
} from './schemas/oauth-issuer-identifier.js';
export {
	oauthAuthorizationServerMetadataSchema,
	oauthAuthorizationServerMetadataValidator,
	type OAuthAuthorizationServerMetadata,
} from './schemas/oauth-authorization-server-metadata.js';
export {
	atprotoAuthorizationServerMetadataValidator,
	type AtprotoAuthorizationServerMetadata,
} from './schemas/atproto-authorization-server-metadata.js';

// protected resource metadata
export {
	oauthBearerMethodSchema,
	oauthProtectedResourceMetadataSchema,
	oauthProtectedResourceMetadataValidator,
	type OAuthBearerMethod,
	type OAuthProtectedResourceMetadata,
} from './schemas/oauth-protected-resource-metadata.js';
export {
	atprotoProtectedResourceMetadataValidator,
	type AtprotoProtectedResourceMetadata,
} from './schemas/atproto-protected-resource-metadata.js';
