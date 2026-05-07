import { isAtprotoDid } from '@atcute/identity';
import type { Did } from '@atcute/lexicons/syntax';

import * as v from 'valibot';

import { atprotoOAuthScopeSchema } from './atproto-oauth-scope.ts';
import { oauthAuthorizationDetailsSchema } from './oauth-authorization-details.ts';

export const atprotoOAuthTokenResponseSchema = v.looseObject({
	access_token: v.string(),
	token_type: v.literal('DPoP'),
	sub: v.pipe(
		v.string(),
		v.check((input) => isAtprotoDid(input), `must be a did:plc or did:web`),
		v.transform((value) => value as Did),
	),
	scope: atprotoOAuthScopeSchema,
	refresh_token: v.optional(v.string()),
	expires_in: v.optional(v.number()),
	// https://datatracker.ietf.org/doc/html/rfc9396#name-enriched-authorization-deta
	authorization_details: v.optional(oauthAuthorizationDetailsSchema),
	// OpenID is not compatible with atproto identities
});

export type AtprotoOAuthTokenResponse = v.InferOutput<typeof atprotoOAuthTokenResponseSchema>;
