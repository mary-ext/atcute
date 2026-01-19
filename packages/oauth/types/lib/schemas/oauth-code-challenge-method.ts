import * as v from '@badrap/valita';

export const oauthCodeChallengeMethodSchema = v.union(v.literal('S256'), v.literal('plain'));

export type OAuthCodeChallengeMethod = v.Infer<typeof oauthCodeChallengeMethodSchema>;
