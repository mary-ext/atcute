import * as v from 'valibot';

import { jwkPubSchema, jwkSchema, type Jwk, type JwkPub } from './jwk.ts';

const filteredKeys = <T>(item: v.GenericSchema<unknown, T>) =>
	v.pipe(
		v.array(v.unknown()),
		v.transform((input): T[] =>
			input.flatMap((entry) => {
				const result = v.safeParse(item, entry);
				return result.success ? [result.output] : [];
			}),
		),
	);

/** JWKS (JSON Web Key Set). implementations SHOULD ignore JWKs within a JWK Set that use unknown
 * `kty` values, are missing required members, or have values out of the supported ranges. */
export const jwksSchema = v.looseObject({
	keys: filteredKeys<Jwk>(jwkSchema),
});

/** public JWKS (JSON Web Key Set with only public keys) */
export const jwksPubSchema = v.looseObject({
	keys: filteredKeys<JwkPub>(jwkPubSchema),
});

export type Jwks = v.InferOutput<typeof jwksSchema>;
export type JwksPub = v.InferOutput<typeof jwksPubSchema>;
