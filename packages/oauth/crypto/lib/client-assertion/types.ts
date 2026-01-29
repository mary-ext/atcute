import type { PrivateJwk, SigningAlgorithm } from '../jwk/types.js';

/**
 * private jwk for client assertion signing.
 */
export type ClientAssertionPrivateJwk = PrivateJwk & {
	alg: SigningAlgorithm;
	kid: string;
};
