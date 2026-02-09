import type { PrivateJwk, SigningAlgorithm } from '../jwk/types.ts';

/**
 * private jwk for client assertion signing.
 */
export type ClientAssertionPrivateJwk = PrivateJwk & {
	alg: SigningAlgorithm;
	kid: string;
};
