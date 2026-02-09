import { getGenerateAlgorithm } from '../internal/crypto.ts';
import { exportPrivateJwkFromKey, isSigningAlgorithm } from '../internal/jwk.ts';
import { setCachedKeyMaterial } from '../internal/key-cache.ts';
import type { SigningAlgorithm } from '../jwk/types.ts';

import type { DpopPrivateJwk } from './types.ts';

/**
 * preferred algorithm order for DPoP key generation.
 */
const PREFERRED_ALGORITHMS: readonly SigningAlgorithm[] = [
	'ES256',
	'ES384',
	'ES512',
	'PS256',
	'PS384',
	'PS512',
	'RS256',
	'RS384',
	'RS512',
];

const sortAlgorithms = (algs: readonly SigningAlgorithm[]): SigningAlgorithm[] => {
	return algs.toSorted((a, b) => {
		const aIdx = PREFERRED_ALGORITHMS.indexOf(a);
		const bIdx = PREFERRED_ALGORITHMS.indexOf(b);

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
 * generates a new DPoP private JWK with `alg` set.
 *
 * @param supportedAlgs server supported algorithms (optional)
 * @returns private JWK (with cache pre-warmed)
 */
export const generateDpopKey = async (supportedAlgs?: readonly string[]): Promise<DpopPrivateJwk> => {
	const normalized = supportedAlgs?.filter(isSigningAlgorithm) ?? [];
	if (supportedAlgs?.length && normalized.length === 0) {
		throw new Error(`no supported algorithms provided`);
	}

	const algs: SigningAlgorithm[] = normalized.length ? sortAlgorithms(normalized) : ['ES256'];
	const errors: unknown[] = [];

	for (const alg of algs) {
		try {
			const pair = await crypto.subtle.generateKey(getGenerateAlgorithm(alg), true, ['sign', 'verify']);
			const jwk = (await exportPrivateJwkFromKey(pair.privateKey, alg)) as DpopPrivateJwk;

			// pre-populate cache so we don't re-import
			setCachedKeyMaterial(jwk, pair.privateKey);

			return jwk;
		} catch (err) {
			errors.push(err);
		}
	}

	throw new AggregateError(errors, `failed to generate DPoP key for any of: ${algs.join(', ')}`);
};
