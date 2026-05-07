import * as v from 'valibot';

/** token type (case-insensitive input, normalized output) */
export const oauthTokenTypeSchema = v.pipe(
	v.string(),
	v.rawTransform<string, 'DPoP' | 'Bearer'>(({ dataset, addIssue, NEVER }) => {
		const lower = dataset.value.toLowerCase();
		if (lower === 'dpop') {
			return 'DPoP';
		}
		if (lower === 'bearer') {
			return 'Bearer';
		}
		addIssue({ message: `must be "DPoP" or "Bearer"` });
		return NEVER;
	}),
);

export type OAuthTokenType = v.InferOutput<typeof oauthTokenTypeSchema>;
