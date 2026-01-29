import { getGenerateAlgorithm } from '../internal/crypto.js';
import { exportPrivateJwkFromKey } from '../internal/jwk.js';
import { setCachedKeyMaterial } from '../internal/key-cache.js';
import type { SigningAlgorithm } from '../jwk/types.js';

import type { ClientAssertionPrivateJwk } from './types.js';

/**
 * generates a new client assertion private key.
 *
 * @param kid key id to assign
 * @param alg signing algorithm (defaults to es256)
 * @returns client assertion private JWK (with cache pre-warmed)
 */
export const generateClientAssertionKey = async (
	kid: string,
	alg: SigningAlgorithm = 'ES256',
): Promise<ClientAssertionPrivateJwk> => {
	const pair = await crypto.subtle.generateKey(getGenerateAlgorithm(alg), true, ['sign', 'verify']);
	const jwk = (await exportPrivateJwkFromKey(pair.privateKey, alg, kid)) as ClientAssertionPrivateJwk;

	// pre-populate cache so we don't re-import
	setCachedKeyMaterial(jwk, pair.privateKey);

	return jwk;
};
