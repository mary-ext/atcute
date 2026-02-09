import * as v from '@badrap/valita';

import { jwkPubSchema, jwkSchema, type Jwk, type JwkPub } from './jwk.ts';

/** JWKS (JSON Web Key Set) */
export const jwksSchema = v.object({
	keys: v.array(v.unknown()).chain((input, options) => {
		// implementations SHOULD ignore JWKs within a JWK Set that use "kty"
		// values that are not understood, are missing required members, or
		// have values out of the supported ranges.
		const keys: Jwk[] = [];

		for (const item of input) {
			const result = jwkSchema.try(item, options);
			if (!result.ok) {
				continue;
			}

			keys.push(result.value);
		}

		return v.ok(keys);
	}),
});

/** public JWKS (JSON Web Key Set with only public keys) */
export const jwksPubSchema = v.object({
	keys: v.array(v.unknown()).chain((input, options) => {
		const keys: JwkPub[] = [];

		for (const item of input) {
			const result = jwkPubSchema.try(item, options);
			if (!result.ok) {
				continue;
			}

			keys.push(result.value);
		}

		return v.ok(keys);
	}),
});

export type Jwks = v.Infer<typeof jwksSchema>;
export type JwksPub = v.Infer<typeof jwksPubSchema>;
