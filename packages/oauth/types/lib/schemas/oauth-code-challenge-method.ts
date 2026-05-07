import * as v from 'valibot';

export const oauthCodeChallengeMethodSchema = v.picklist(['S256', 'plain']);

export type OAuthCodeChallengeMethod = v.InferOutput<typeof oauthCodeChallengeMethodSchema>;
