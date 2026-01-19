import type { OAuthAuthorizationServerMetadata } from '@atcute/oauth-types';

export interface PersistedAuthorizationServerMetadata extends Pick<
	OAuthAuthorizationServerMetadata,
	| 'issuer'
	| 'authorization_endpoint'
	| 'introspection_endpoint'
	| 'pushed_authorization_request_endpoint'
	| 'revocation_endpoint'
	| 'token_endpoint'
> {}
