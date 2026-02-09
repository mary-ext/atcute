export { buildClientMetadata, buildPublicClientMetadata } from './build-client-metadata.ts';
export { CLIENT_ASSERTION_TYPE_JWT_BEARER, FALLBACK_ALG } from './constants.ts';

export * as scope from './scope.ts';

// schemas
export {
	confidentialClientMetadataSchema,
	type ConfidentialClientMetadata,
} from './schemas/atcute-confidential-client-metadata.ts';
export {
	discoverablePublicClientMetadataSchema,
	loopbackClientMetadataSchema,
	publicClientMetadataSchema,
	type DiscoverablePublicClientMetadata,
	type LoopbackClientMetadata,
	type PublicClientMetadata,
} from './schemas/atcute-public-client-metadata.ts';
export {
	atprotoOAuthScopeSchema,
	ATPROTO_SCOPE_VALUE,
	DEFAULT_ATPROTO_OAUTH_SCOPE,
	type AtprotoOAuthScope,
} from './schemas/atproto-oauth-scope.ts';
export {
	jwkPubSchema,
	jwkSchema,
	keyUsageSchema,
	publicKeyUsageSchema,
	type Jwk,
	type JwkPub,
	type KeyUsage,
} from './schemas/jwk.ts';
export { jwksPubSchema, jwksSchema, type Jwks, type JwksPub } from './schemas/jwks.ts';
export { oauthClientIdDiscoverableSchema } from './schemas/oauth-client-id-discoverable.ts';
export { oauthClientIdSchema, type OAuthClientId } from './schemas/oauth-client-id.ts';
export { oauthClientMetadataSchema, type OAuthClientMetadata } from './schemas/oauth-client-metadata.ts';
export {
	oauthEndpointAuthMethodSchema,
	type OAuthEndpointAuthMethod,
} from './schemas/oauth-endpoint-auth-method.ts';
export { oauthGrantTypeSchema, type OAuthGrantType } from './schemas/oauth-grant-type.ts';
export {
	loopbackRedirectUriSchema,
	oauthRedirectUriSchema,
	type LoopbackRedirectUri,
	type OAuthRedirectUri,
} from './schemas/oauth-redirect-uri.ts';
export { oauthResponseTypeSchema, type OAuthResponseType } from './schemas/oauth-response-type.ts';
export {
	isOAuthScope,
	OAUTH_SCOPE_REGEXP,
	oauthScopeSchema,
	type OAuthScope,
} from './schemas/oauth-scope.ts';
export {
	httpsUriSchema,
	loopbackUriSchema,
	nonLocalWebUriSchema,
	privateUseUriSchema,
	urlSchema,
	webUriSchema,
} from './schemas/uri.ts';
export {
	extractUrlPath,
	isHostnameIP,
	isLastOccurrence,
	isLocalHostname,
	isLoopbackHost,
	isSpaceSeparatedValue,
} from './schemas/utils.ts';

// token schemas
export { oauthTokenTypeSchema, type OAuthTokenType } from './schemas/oauth-token-type.ts';
export { oauthTokenResponseSchema, type OAuthTokenResponse } from './schemas/oauth-token-response.ts';
export {
	atprotoOAuthTokenResponseSchema,
	type AtprotoOAuthTokenResponse,
} from './schemas/atproto-oauth-token-response.ts';

// PAR schemas
export { oauthParResponseSchema, type OAuthParResponse } from './schemas/oauth-par-response.ts';
export {
	oauthCodeChallengeMethodSchema,
	type OAuthCodeChallengeMethod,
} from './schemas/oauth-code-challenge-method.ts';
export { oauthResponseModeSchema, type OAuthResponseMode } from './schemas/oauth-response-mode.ts';
export { oauthPromptSchema, type OAuthPrompt } from './schemas/oauth-prompt.ts';

// authorization details
export {
	oauthAuthorizationDetailSchema,
	oauthAuthorizationDetailsSchema,
	type OAuthAuthorizationDetail,
	type OAuthAuthorizationDetails,
} from './schemas/oauth-authorization-details.ts';

// server metadata
export {
	oauthIssuerIdentifierSchema,
	type OAuthIssuerIdentifier,
} from './schemas/oauth-issuer-identifier.ts';
export {
	oauthAuthorizationServerMetadataSchema,
	oauthAuthorizationServerMetadataValidator,
	type OAuthAuthorizationServerMetadata,
} from './schemas/oauth-authorization-server-metadata.ts';
export {
	atprotoAuthorizationServerMetadataValidator,
	type AtprotoAuthorizationServerMetadata,
} from './schemas/atproto-authorization-server-metadata.ts';

// protected resource metadata
export {
	oauthBearerMethodSchema,
	oauthProtectedResourceMetadataSchema,
	oauthProtectedResourceMetadataValidator,
	type OAuthBearerMethod,
	type OAuthProtectedResourceMetadata,
} from './schemas/oauth-protected-resource-metadata.ts';
export {
	atprotoProtectedResourceMetadataValidator,
	type AtprotoProtectedResourceMetadata,
} from './schemas/atproto-protected-resource-metadata.ts';
