import * as v from 'valibot';

export const oauthGrantTypeSchema = v.picklist([
	'authorization_code',
	'implicit',
	'refresh_token',
	'password', // not part of OAuth 2.1
	'client_credentials',
	'urn:ietf:params:oauth:grant-type:jwt-bearer',
	'urn:ietf:params:oauth:grant-type:saml2-bearer',
]);

export type OAuthGrantType = v.InferOutput<typeof oauthGrantTypeSchema>;
