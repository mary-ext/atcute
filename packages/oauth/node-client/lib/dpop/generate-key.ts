import { type JWK, exportJWK, generateKeyPair } from 'jose';

/**
 * preferred algorithm order for DPoP key generation.
 * ES256K > ES (shorter first) > PS (shorter first) > RS (shorter first)
 */
const PREFERRED_ALGORITHMS = [
	'ES256K',
	'ES256',
	'ES384',
	'ES512',
	'PS256',
	'PS384',
	'PS512',
	'RS256',
	'RS384',
	'RS512',
] as const;

/**
 * sorts algorithms by preference order.
 * ES256K > ES (shorter first) > PS (shorter first) > RS (shorter first) > other
 */
const sortAlgorithms = (algs: readonly string[]): string[] => {
	return [...algs].sort((a, b) => {
		const aIdx = PREFERRED_ALGORITHMS.indexOf(a as (typeof PREFERRED_ALGORITHMS)[number]);
		const bIdx = PREFERRED_ALGORITHMS.indexOf(b as (typeof PREFERRED_ALGORITHMS)[number]);

		// known algorithms come before unknown
		if (aIdx === -1 && bIdx === -1) {
			return 0;
		}
		if (aIdx === -1) {
			return 1;
		}
		if (bIdx === -1) {
			return -1;
		}

		return aIdx - bIdx;
	});
};

/**
 * generates a new DPoP key (private JWK with `alg` set).
 *
 * @param supportedAlgs algorithms supported by the server (from `dpop_signing_alg_values_supported`)
 * @returns private JWK with `alg` field set
 */
export const generateDpopKey = async (supportedAlgs?: readonly string[]): Promise<JWK> => {
	// default to ES256 per atproto spec
	const algs = supportedAlgs?.length ? sortAlgorithms(supportedAlgs) : ['ES256'];

	const errors: unknown[] = [];

	for (const alg of algs) {
		try {
			const { privateKey } = await generateKeyPair(alg, { extractable: true });

			// export to JWK for storage
			const jwk = await exportJWK(privateKey);
			jwk.alg = alg;

			return jwk;
		} catch (err) {
			errors.push(err);
		}
	}

	throw new AggregateError(errors, `failed to generate DPoP key for any of: ${algs.join(', ')}`);
};
