import { getGenerateAlgorithm } from '../internal/crypto.ts';
import { exportPrivateJwkFromKey } from '../internal/jwk.ts';
import { setCachedKeyMaterial } from '../internal/key-cache.ts';
import type { SigningAlgorithm } from '../jwk/types.ts';

import type { ClientAssertionPrivateJwk } from './types.ts';

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
