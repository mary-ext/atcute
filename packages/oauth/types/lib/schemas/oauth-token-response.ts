import * as v from '@badrap/valita';

import { oauthAuthorizationDetailsSchema } from './oauth-authorization-details.ts';
import { oauthTokenTypeSchema } from './oauth-token-type.ts';

/**
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-5.1 | RFC 6749 (OAuth2), Section 5.1}
 */
export const oauthTokenResponseSchema = v.object({
	// https://www.rfc-editor.org/rfc/rfc6749.html#section-5.1
	access_token: v.string(),
	token_type: oauthTokenTypeSchema,
	scope: v.string().optional(),
	refresh_token: v.string().optional(),
	expires_in: v.number().optional(),
	// https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse
	id_token: v.string().optional(),
	// https://datatracker.ietf.org/doc/html/rfc9396#name-enriched-authorization-deta
	authorization_details: oauthAuthorizationDetailsSchema.optional(),
});

export type OAuthTokenResponse = v.Infer<typeof oauthTokenResponseSchema>;
