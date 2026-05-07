import * as v from 'valibot';

export const oauthResponseModeSchema = v.picklist(['query', 'fragment', 'form_post']);

export type OAuthResponseMode = v.InferOutput<typeof oauthResponseModeSchema>;
