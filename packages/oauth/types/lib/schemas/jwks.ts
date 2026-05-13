import * as v from 'valibot';

import { jwkPubSchema, jwkSchema, type Jwk, type JwkPub } from './jwk.ts';

/**
 * JWKS (JSON Web Key Set). implementations SHOULD ignore JWKs within a JWK Set that use unknown `kty` values,
 * are missing required members, or have values out of the supported ranges.
 */
export const jwksSchema = v.looseObject({
	keys: v.pipe(
		v.array(v.unknown()),
		v.transform((input): Jwk[] =>
			input.flatMap((entry) => {
				const result = v.safeParse(jwkSchema, entry);
				return result.success ? [result.output] : [];
			}),
		),
	),
});

/** public JWKS (JSON Web Key Set with only public keys) */
export const jwksPubSchema = v.looseObject({
	keys: v.pipe(
		v.array(v.unknown()),
		v.transform((input): JwkPub[] =>
			input.flatMap((entry) => {
				const result = v.safeParse(jwkPubSchema, entry);
				return result.success ? [result.output] : [];
			}),
		),
	),
});

export type Jwks = v.InferOutput<typeof jwksSchema>;
export type JwksPub = v.InferOutput<typeof jwksPubSchema>;
