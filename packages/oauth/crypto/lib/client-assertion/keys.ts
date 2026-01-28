import {
	derivePublicJwk,
	exportPrivateJwkFromKey,
	importPkcs8PrivateKey,
	importPrivateKeyFromJwk,
	parsePrivateJwkInput,
	resolveSigningAlgorithm,
} from '../internal/jwk.js';
import type { SigningAlgorithm } from '../jwk/types.js';

import type { ClientAssertionPrivateJwk, ClientAssertionPrivateKey } from './types.js';

export interface ImportClientAssertionKeyOptions {
	kid?: string;
	alg?: SigningAlgorithm;
}

/**
 * imports a client assertion private key from a jwk object or json string.
 *
 * @param input jwk object or json string
 * @param options optional kid/alg overrides
 * @returns imported client assertion key
 */
export const importClientAssertionPrivateJwk = async (
	input: ClientAssertionPrivateJwk | string,
	options?: ImportClientAssertionKeyOptions,
): Promise<ClientAssertionPrivateKey> => {
	const jwk = parsePrivateJwkInput(input) as ClientAssertionPrivateJwk;
	const kid = options?.kid ?? jwk.kid;
	if (!kid) {
		throw new Error(`kid is required: provide via options or include in jwk`);
	}

	const alg = resolveSigningAlgorithm(jwk, options?.alg);
	if (!alg) {
		throw new Error(`alg is required: provide via options or include in jwk`);
	}

	const key = await importPrivateKeyFromJwk(jwk, alg);
	const normalized: ClientAssertionPrivateJwk = { ...jwk, kid, alg };
	const publicJwk = derivePublicJwk(normalized, kid, alg);

	return { jwk: normalized, key, publicJwk, kid, alg };
};

/**
 * imports a client assertion private key from a pkcs8 pem string.
 *
 * @param pem pkcs8 pem string
 * @param options import options (kid + alg)
 * @returns imported client assertion key
 */
export const importClientAssertionPkcs8 = async (
	pem: string,
	options: { kid: string; alg: SigningAlgorithm },
): Promise<ClientAssertionPrivateKey> => {
	const { kid, alg } = options;
	const key = await importPkcs8PrivateKey(pem, alg);
	const jwk = (await exportPrivateJwkFromKey(key, alg, kid)) as ClientAssertionPrivateJwk;
	const publicJwk = derivePublicJwk(jwk, kid, alg);

	return { jwk, key, publicJwk, kid, alg };
};
