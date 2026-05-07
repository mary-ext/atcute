import * as v from 'valibot';

const isPositiveInteger = (n: number): boolean => Number.isInteger(n) && n > 0;

export const oauthParResponseSchema = v.looseObject({
	request_uri: v.string(),
	expires_in: v.pipe(v.number(), v.check(isPositiveInteger, `must be a positive integer`)),
});

export type OAuthParResponse = v.InferOutput<typeof oauthParResponseSchema>;
