import { exportPkcs8PrivateKey as exportPkcs8 } from '../internal/jwk.js';
import { getCachedKeyMaterial } from '../internal/key-cache.js';

import type { PrivateJwk } from './types.js';

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
