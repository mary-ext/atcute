import * as v from 'valibot';

export const oauthCodeChallengeMethodSchema = v.union([v.literal('S256'), v.literal('plain')]);

export type OAuthCodeChallengeMethod = v.InferOutput<typeof oauthCodeChallengeMethodSchema>;
