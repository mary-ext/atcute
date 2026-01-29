import { nanoid } from 'nanoid';

import { signJwt } from '../jwt/index.js';

import type { ClientAssertionPrivateKey } from './types.js';

export interface CreateClientAssertionOptions {
	/** client id (used as iss and sub) */
	clientId: string;
	/** authorization server issuer (used as aud) */
	audience: string;
	/** JWK thumbprint of the DPoP key to bind to (cnf.jkt) */
	jkt?: string;
	/** client assertion signing key */
	key: ClientAssertionPrivateKey;
}

/**
 * creates a DPoP-bound client assertion per RFC 7523.
 *
 * @param options creation options
 * @returns signed client assertion JWT
 */
export const createClientAssertion = async (options: CreateClientAssertionOptions): Promise<string> => {
	const { clientId, audience, jkt, key } = options;
	const now = Math.floor(Date.now() / 1000);
	const cnf = jkt ? { jkt } : undefined;

	return signJwt({
		header: {
			alg: key.alg,
			kid: key.kid,
		},
		payload: {
			iss: clientId,
			sub: clientId,
			aud: audience,
			jti: nanoid(24),
			iat: now,
			exp: now + 60,
			cnf,
		},
		key: key.key,
		alg: key.alg,
	});
};
