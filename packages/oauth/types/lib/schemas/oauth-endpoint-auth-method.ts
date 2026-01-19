import * as v from '@badrap/valita';

export const oauthEndpointAuthMethodSchema = v.union(
	v.literal('client_secret_basic'),
	v.literal('client_secret_jwt'),
	v.literal('client_secret_post'),
	v.literal('none'),
	v.literal('private_key_jwt'),
	v.literal('self_signed_tls_client_auth'),
	v.literal('tls_client_auth'),
);

export type OAuthEndpointAuthMethod = v.Infer<typeof oauthEndpointAuthMethodSchema>;
