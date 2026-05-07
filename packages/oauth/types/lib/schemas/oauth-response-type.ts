import * as v from 'valibot';

export const oauthResponseTypeSchema = v.union([
	// OAuth2 (https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-10#section-4.1.1)
	v.literal('code'), // Authorization Code Grant
	v.literal('token'), // Implicit Grant

	// OIDC (https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html)
	v.literal('none'),
	v.literal('code id_token token'),
	v.literal('code id_token'),
	v.literal('code token'),
	v.literal('id_token token'),
	v.literal('id_token'),
]);

export type OAuthResponseType = v.InferOutput<typeof oauthResponseTypeSchema>;
