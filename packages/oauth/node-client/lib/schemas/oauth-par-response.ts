import * as v from '@badrap/valita';

const isPositiveInteger = (n: number): boolean => Number.isInteger(n) && n > 0;

export const oauthParResponseSchema = v.object({
	request_uri: v.string(),
	expires_in: v.number().assert(isPositiveInteger, `must be a positive integer`),
});

export type OAuthParResponse = v.Infer<typeof oauthParResponseSchema>;
