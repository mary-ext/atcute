import * as v from '@badrap/valita';

/** token type (case-insensitive input, normalized output) */
export const oauthTokenTypeSchema = v.string().chain((input) => {
	const lower = input.toLowerCase();
	if (lower === 'dpop') {
		return v.ok('DPoP');
	}
	if (lower === 'bearer') {
		return v.ok('Bearer');
	}
	return v.err(`must be "DPoP" or "Bearer"`);
});

export type OAuthTokenType = v.Infer<typeof oauthTokenTypeSchema>;
