import { toBase64Url } from '@atcute/multibase';
import { encodeUtf8, toSha256 } from '@atcute/uint8array';

import type { PublicJwk } from './types.js';

/**
 * computes the jwk thumbprint (rfc 7638) for a public key.
 *
 * @param jwk public jwk
 * @returns base64url-encoded sha-256 thumbprint
 */
export const computeJktFromJwk = async (jwk: PublicJwk): Promise<string> => {
	let canonical: Record<string, string>;

	if (jwk.kty === 'EC') {
		const { crv, x, y } = jwk;
		canonical = { crv, kty: jwk.kty, x, y };
	} else {
		const { e, n } = jwk;
		canonical = { e, kty: jwk.kty, n };
	}

	const serialized = JSON.stringify(canonical);
	const hash = await toSha256(encodeUtf8(serialized));

	return toBase64Url(hash);
};
