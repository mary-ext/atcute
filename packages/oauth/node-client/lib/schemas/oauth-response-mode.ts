import * as v from '@badrap/valita';

export const oauthResponseModeSchema = v.union(
	v.literal('query'),
	v.literal('fragment'),
	v.literal('form_post'),
);

export type OAuthResponseMode = v.Infer<typeof oauthResponseModeSchema>;
