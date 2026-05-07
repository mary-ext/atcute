import * as v from 'valibot';

/** base OAuth client ID (any non-empty string) */
export const oauthClientIdSchema = v.pipe(v.string(), v.nonEmpty(`must not be empty`));

export type OAuthClientId = v.InferOutput<typeof oauthClientIdSchema>;
