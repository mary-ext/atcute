import { nanoid } from 'nanoid';

import { sha256Base64Url } from './sha256.js';

/**
 * generates pkce verifier and challenge (s256).
 *
 * @param length verifier length (43-128 per rfc 7636)
 * @returns pkce values
 */
export const generatePkce = async (
	length = 64,
): Promise<{ verifier: string; challenge: string; method: 'S256' }> => {
	const verifier = nanoid(length);
	const challenge = await sha256Base64Url(verifier);

	return { verifier, challenge, method: 'S256' };
};
