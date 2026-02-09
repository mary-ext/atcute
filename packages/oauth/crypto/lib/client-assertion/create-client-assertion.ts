import { nanoid } from 'nanoid';

import { getCachedKeyMaterial } from '../internal/key-cache.ts';
import { signJwt } from '../jwt/index.ts';

import type { ClientAssertionPrivateJwk } from './types.ts';

export interface CreateClientAssertionOptions {
	/** client id */
	client_id: string;
	/** authorization server issuer */
	aud: string;
	/** JWK thumbprint of the DPoP key to bind to (for CAB pattern) */
	jkt?: string;
	/** client assertion signing key */
	key: ClientAssertionPrivateJwk;
}

/**
 * creates a DPoP-bound client assertion per RFC 7523.
 *
 * @param options creation options
 * @returns signed client assertion JWT
 */
export const createClientAssertion = async (options: CreateClientAssertionOptions): Promise<string> => {
	const { client_id, aud, jkt, key } = options;
	const { kid, alg } = key;
	const { cryptoKey } = await getCachedKeyMaterial(key);

	const now = Math.floor(Date.now() / 1000);
	const cnf = jkt ? { jkt } : undefined;

	return signJwt({
		header: {
			alg,
			kid,
		},
		payload: {
			iss: client_id,
			sub: client_id,
			aud: aud,
			jti: nanoid(24),
			iat: now,
			exp: now + 60,
			cnf,
		},
		key: cryptoKey,
		alg,
	});
};
