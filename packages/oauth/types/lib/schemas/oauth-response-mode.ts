import * as v from 'valibot';

export const oauthResponseModeSchema = v.union([
	v.literal('query'),
	v.literal('fragment'),
	v.literal('form_post'),
]);

export type OAuthResponseMode = v.InferOutput<typeof oauthResponseModeSchema>;
