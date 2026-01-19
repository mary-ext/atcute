import * as v from '@badrap/valita';

import { isAtprotoDid } from '@atcute/identity';

import { atprotoOAuthScopeSchema } from './atproto-oauth-scope.js';
import { oauthAuthorizationDetailsSchema } from './oauth-authorization-details.js';

export const atprotoOAuthTokenResponseSchema = v.object({
	access_token: v.string(),
	token_type: v.literal('DPoP'),
	sub: v.string().assert(isAtprotoDid, `must be a did:plc or did:web`),
	scope: atprotoOAuthScopeSchema,
	refresh_token: v.string().optional(),
	expires_in: v.number().optional(),
	// https://datatracker.ietf.org/doc/html/rfc9396#name-enriched-authorization-deta
	authorization_details: oauthAuthorizationDetailsSchema.optional(),
	// OpenID is not compatible with atproto identities
});

export type AtprotoOAuthTokenResponse = v.Infer<typeof atprotoOAuthTokenResponseSchema>;
