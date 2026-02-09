import type { PrivateJwk, PublicJwk } from '../jwk/types.ts';

import { derivePublicJwk, importPrivateKeyFromJwk } from './jwk.ts';

/**
 * cached key material for a JWK.
 */
export interface CachedKeyMaterial {
	cryptoKey: CryptoKey;
	publicJwk: PublicJwk;
}

/**
 * cache for imported keys.
 * uses WeakMap so entries are garbage collected when JWK objects are no longer referenced.
 */
const keyCache = new WeakMap<PrivateJwk, CachedKeyMaterial>();

/**
 * retrieves or creates cached key material for a JWK.
 *
 * @param jwk private JWK to get material for
 * @returns cached key material (CryptoKey and derived public JWK)
 */
export const getCachedKeyMaterial = async (jwk: PrivateJwk): Promise<CachedKeyMaterial> => {
	const cached = keyCache.get(jwk);
	if (cached) {
		return cached;
	}

	const { alg } = jwk;
	const cryptoKey = await importPrivateKeyFromJwk(jwk, alg);
	const publicJwk = derivePublicJwk(jwk, jwk.kid, alg);
	const material: CachedKeyMaterial = { cryptoKey, publicJwk };

	keyCache.set(jwk, material);

	return material;
};

/**
 * pre-populates the cache with already-imported key material.
 * useful for PKCS8 imports where we already have the CryptoKey.
 *
 * @param jwk private JWK to cache for
 * @param cryptoKey already-imported CryptoKey
 */
export const setCachedKeyMaterial = (jwk: PrivateJwk, cryptoKey: CryptoKey): void => {
	const publicJwk = derivePublicJwk(jwk, jwk.kid, jwk.alg);
	keyCache.set(jwk, { cryptoKey, publicJwk });
};
