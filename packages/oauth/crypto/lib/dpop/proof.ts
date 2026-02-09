import { nanoid } from 'nanoid';

import type { CachedKeyMaterial } from '../internal/key-cache.ts';
import { getCachedKeyMaterial } from '../internal/key-cache.ts';
import { signJwt } from '../jwt/index.ts';

import type { DpopPrivateJwk } from './types.ts';

/**
 * creates a DPoP proof signer.
 *
 * @param jwk DPoP private JWK (with `alg` set)
 * @returns signing function for DPoP proofs
 */
export const createDpopProofSigner = (
	jwk: DpopPrivateJwk,
): ((htm: string, htu: string, nonce?: string, ath?: string) => Promise<string>) => {
	const alg = jwk.alg;

	// lazily resolve key material on first sign
	let materialPromise: Promise<CachedKeyMaterial> | undefined;

	return async (htm: string, htu: string, nonce?: string, ath?: string) => {
		materialPromise ||= getCachedKeyMaterial(jwk);
		const { cryptoKey, publicJwk } = await materialPromise;

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
