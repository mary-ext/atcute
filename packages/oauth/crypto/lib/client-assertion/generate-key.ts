import { getGenerateAlgorithm } from '../internal/crypto.js';
import { derivePublicJwk, exportPrivateJwkFromKey } from '../internal/jwk.js';
import type { SigningAlgorithm } from '../jwk/types.js';

import type { ClientAssertionPrivateKey, ClientAssertionPrivateJwk } from './types.js';

/**
 * generates a new client assertion private key.
 *
 * @param kid key id to assign
 * @param alg signing algorithm (defaults to es256)
 * @returns client assertion private key
 */
export const generateClientAssertionKey = async (
	kid: string,
	alg: SigningAlgorithm = 'ES256',
): Promise<ClientAssertionPrivateKey> => {
	const pair = await crypto.subtle.generateKey(getGenerateAlgorithm(alg), true, ['sign', 'verify']);
	const jwk = (await exportPrivateJwkFromKey(pair.privateKey, alg, kid)) as ClientAssertionPrivateJwk;
	const publicJwk = derivePublicJwk(jwk, kid, alg);

	return { jwk, key: pair.privateKey, publicJwk, kid, alg };
};
