import { exportPrivateJwkFromKey, importPkcs8PrivateKey } from '../internal/jwk.ts';
import { setCachedKeyMaterial } from '../internal/key-cache.ts';
import type { SigningAlgorithm } from '../jwk/types.ts';

import type { ClientAssertionPrivateJwk } from './types.ts';

/**
 * imports a client assertion private key from a pkcs8 pem string.
 *
 * @param pem pkcs8 pem string
 * @param options import options (kid + alg)
 * @returns client assertion private JWK (with cache pre-warmed)
 */
export const importClientAssertionPkcs8 = async (
	pem: string,
	options: { kid: string; alg: SigningAlgorithm },
): Promise<ClientAssertionPrivateJwk> => {
	const { kid, alg } = options;
	const cryptoKey = await importPkcs8PrivateKey(pem, alg);
	const jwk = (await exportPrivateJwkFromKey(cryptoKey, alg, kid)) as ClientAssertionPrivateJwk;

	// pre-populate cache so we don't re-import
	setCachedKeyMaterial(jwk, cryptoKey);

	return jwk;
};
