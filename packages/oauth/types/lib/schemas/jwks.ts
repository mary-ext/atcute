import * as v from 'valibot';

import { jwkPubSchema, jwkSchema, type Jwk, type JwkPub } from './jwk.ts';

/** JWKS (JSON Web Key Set) */
export const jwksSchema = v.looseObject({
	keys: v.pipe(
		v.array(v.unknown()),
		v.transform((input): Jwk[] => {
			// implementations SHOULD ignore JWKs within a JWK Set that use "kty"
			// values that are not understood, are missing required members, or
			// have values out of the supported ranges.
			const keys: Jwk[] = [];
			for (const item of input) {
				const result = v.safeParse(jwkSchema, item);
				if (result.success) {
					keys.push(result.output);
				}
			}
			return keys;
		}),
	),
});

/** public JWKS (JSON Web Key Set with only public keys) */
export const jwksPubSchema = v.looseObject({
	keys: v.pipe(
		v.array(v.unknown()),
		v.transform((input): JwkPub[] => {
			const keys: JwkPub[] = [];
			for (const item of input) {
				const result = v.safeParse(jwkPubSchema, item);
				if (result.success) {
					keys.push(result.output);
				}
			}
			return keys;
		}),
	),
});

export type Jwks = v.InferOutput<typeof jwksSchema>;
export type JwksPub = v.InferOutput<typeof jwksPubSchema>;
