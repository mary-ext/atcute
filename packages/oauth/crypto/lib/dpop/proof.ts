import { nanoid } from 'nanoid';

import { signJwt } from '../jwt/index.js';

import type { DpopPrivateKey } from './types.js';

/**
 * creates a DPoP proof signer.
 *
 * @param key imported DPoP key
 * @returns signing function for DPoP proofs
 */
export const createDpopProofSigner = (
	key: DpopPrivateKey,
): ((htm: string, htu: string, nonce?: string, ath?: string) => Promise<string>) => {
	const { jwk, publicJwk, key: cryptoKey } = key;
	const alg = jwk.alg;

	return async (htm: string, htu: string, nonce?: string, ath?: string) => {
		const now = Math.floor(Date.now() / 1_000);

		return signJwt({
			header: {
				typ: 'dpop+jwt',
				jwk: publicJwk,
			},
			payload: {
				htm,
				htu,
				iat: now,
				jti: nanoid(24),
				nonce,
				ath,
			},
			key: cryptoKey,
			alg,
		});
	};
};
