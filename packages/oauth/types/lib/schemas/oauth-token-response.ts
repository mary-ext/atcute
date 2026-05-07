import * as v from 'valibot';

import { oauthAuthorizationDetailsSchema } from './oauth-authorization-details.ts';
import { oauthTokenTypeSchema } from './oauth-token-type.ts';

/**
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-5.1 | RFC 6749 (OAuth2), Section 5.1}
 */
export const oauthTokenResponseSchema = v.looseObject({
	// https://www.rfc-editor.org/rfc/rfc6749.html#section-5.1
	access_token: v.string(),
	token_type: oauthTokenTypeSchema,
	scope: v.optional(v.string()),
	refresh_token: v.optional(v.string()),
	expires_in: v.optional(v.number()),
	// https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse
	id_token: v.optional(v.string()),
	// https://datatracker.ietf.org/doc/html/rfc9396#name-enriched-authorization-deta
	authorization_details: v.optional(oauthAuthorizationDetailsSchema),
});

export type OAuthTokenResponse = v.InferOutput<typeof oauthTokenResponseSchema>;
