import { nanoid } from 'nanoid';

import { sha256 } from './utils/crypto.js';

/**
 * PKCE challenge and verifier pair.
 */
export interface PkceChallenge {
	/** code verifier (random string) */
	verifier: string;
	/** code challenge (SHA-256 hash of verifier, base64url encoded) */
	challenge: string;
	/** challenge method */
	method: 'S256';
}

/**
 * generates a PKCE code verifier and challenge.
 *
 * @returns PKCE verifier, challenge (base64url SHA-256), and method
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.1}
 */
export const generatePkce = async (): Promise<PkceChallenge> => {
	// 43 chars matches 32 bytes base64url encoded per RFC 7636
	const verifier = nanoid(44);
	const challenge = await sha256(verifier);

	return { verifier, challenge, method: 'S256' };
};
