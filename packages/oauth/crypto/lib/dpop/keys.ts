import {
	derivePublicJwk,
	exportPrivateJwkFromKey,
	importPkcs8PrivateKey,
	importPrivateKeyFromJwk,
	parsePrivateJwkInput,
	resolveSigningAlgorithm,
} from '../internal/jwk.js';
import type { SigningAlgorithm } from '../jwk/types.js';

import type { DpopPrivateJwk, DpopPrivateKey } from './types.js';

export interface ImportDpopKeyOptions {
	alg?: SigningAlgorithm;
}

/**
 * imports a DPoP private key from a JWK object or JSON string.
 *
 * @param input JWK object or JSON string
 * @param options optional alg override
 * @returns imported DPoP key
 */
export const importDpopPrivateJwk = async (
	input: DpopPrivateJwk | string,
	options?: ImportDpopKeyOptions,
): Promise<DpopPrivateKey> => {
	const jwk = parsePrivateJwkInput(input) as DpopPrivateJwk;
	const alg = resolveSigningAlgorithm(jwk, options?.alg);
	if (!alg) {
		throw new Error(`alg is required: provide via options or include in jwk`);
	}

	const key = await importPrivateKeyFromJwk(jwk, alg);
	const normalized: DpopPrivateJwk = { ...jwk, alg };
	const publicJwk = derivePublicJwk(normalized, normalized.kid, alg);

	return { jwk: normalized, key, publicJwk };
};

/**
 * imports a DPoP private key from a PKCS8 PEM string.
 *
 * @param pem PKCS8 PEM string
 * @param options import options
 * @returns imported DPoP key
 */
export const importDpopPkcs8 = async (
	pem: string,
	options: { alg: SigningAlgorithm },
): Promise<DpopPrivateKey> => {
	const { alg } = options;
	const key = await importPkcs8PrivateKey(pem, alg);
	const jwk = (await exportPrivateJwkFromKey(key, alg)) as DpopPrivateJwk;
	const publicJwk = derivePublicJwk(jwk, jwk.kid, alg);

	return { jwk, key, publicJwk };
};
