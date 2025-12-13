import * as v from '@badrap/valita';

export const oauthGrantTypeSchema = v.union(
	v.literal('authorization_code'),
	v.literal('implicit'),
	v.literal('refresh_token'),
	v.literal('password'), // not part of OAuth 2.1
	v.literal('client_credentials'),
	v.literal('urn:ietf:params:oauth:grant-type:jwt-bearer'),
	v.literal('urn:ietf:params:oauth:grant-type:saml2-bearer'),
);

export type OAuthGrantType = v.Infer<typeof oauthGrantTypeSchema>;
