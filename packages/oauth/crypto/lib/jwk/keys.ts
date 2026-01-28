import { exportPkcs8PrivateKey as exportPkcs8 } from '../internal/jwk.js';
import { exportPrivateJwkFromKey } from '../internal/jwk.js';

import type { PrivateJwk, SigningAlgorithm } from './types.js';

export interface ExportablePrivateKey {
	key: CryptoKey;
	jwk: { alg: SigningAlgorithm; kid?: string };
}

export type ExportedPrivateJwk = PrivateJwk & { alg: SigningAlgorithm; kid?: string };

/**
 * exports a private key to jwk format.
 *
 * @param key private key to export
 * @returns jwk with alg/kid preserved
 */
export const exportPrivateJwk = async (key: ExportablePrivateKey): Promise<ExportedPrivateJwk> => {
	const { alg, kid } = key.jwk;
	const jwk = (await exportPrivateJwkFromKey(key.key, alg, kid)) as ExportedPrivateJwk;
	return jwk;
};

/**
 * exports a private key to pkcs8 pem format.
 *
 * @param key private key to export
 * @returns pkcs8 pem string
 */
export const exportPkcs8PrivateKey = async (key: ExportablePrivateKey): Promise<string> => {
	return exportPkcs8(key.key);
};
