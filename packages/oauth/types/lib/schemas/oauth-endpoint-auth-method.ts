import * as v from 'valibot';

export const oauthEndpointAuthMethodSchema = v.picklist([
	'client_secret_basic',
	'client_secret_jwt',
	'client_secret_post',
	'none',
	'private_key_jwt',
	'self_signed_tls_client_auth',
	'tls_client_auth',
]);

export type OAuthEndpointAuthMethod = v.InferOutput<typeof oauthEndpointAuthMethodSchema>;
