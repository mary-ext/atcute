import { getGenerateAlgorithm } from '../internal/crypto.js';
import { exportPrivateJwkFromKey, isSigningAlgorithm } from '../internal/jwk.js';
import type { SigningAlgorithm } from '../jwk/types.js';

import type { DpopPrivateJwk } from './types.js';

/**
 * preferred algorithm order for dpop key generation.
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
	return [...algs].sort((a, b) => {
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
 * generates a new dpop private jwk with `alg` set.
 *
 * @param supportedAlgs server supported algorithms (optional)
 * @returns private jwk ready for storage
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
			const jwk = await exportPrivateJwkFromKey(pair.privateKey, alg);
			return jwk as DpopPrivateJwk;
		} catch (err) {
			errors.push(err);
		}
	}

	throw new AggregateError(errors, `failed to generate dpop key for any of: ${algs.join(', ')}`);
};
