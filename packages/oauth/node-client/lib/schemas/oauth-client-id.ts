import * as v from '@badrap/valita';

/** base OAuth client ID (any non-empty string) */
export const oauthClientIdSchema = v.string().assert((input) => input.length > 0, `must not be empty`);

export type OAuthClientId = v.Infer<typeof oauthClientIdSchema>;
