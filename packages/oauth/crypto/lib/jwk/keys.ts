import { exportPkcs8PrivateKey as exportPkcs8 } from '../internal/jwk.ts';
import { getCachedKeyMaterial } from '../internal/key-cache.ts';

import type { PrivateJwk } from './types.ts';

/**
 * exports a private JWK to PKCS8 PEM format.
 *
 * @param jwk private JWK to export
 * @returns PKCS8 PEM string
 */
export const exportPkcs8PrivateKey = async (jwk: PrivateJwk): Promise<string> => {
	const { cryptoKey } = await getCachedKeyMaterial(jwk);
	return exportPkcs8(cryptoKey);
};
