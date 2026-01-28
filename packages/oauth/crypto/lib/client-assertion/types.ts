import type { PrivateJwk, PublicJwk, SigningAlgorithm } from '../jwk/types.js';

/**
 * private jwk for client assertion signing.
 */
export type ClientAssertionPrivateJwk = PrivateJwk & {
	alg: SigningAlgorithm;
	kid: string;
};

/**
 * imported client assertion key, ready for signing.
 */
export interface ClientAssertionPrivateKey {
	/** key id */
	kid: string;
	/** signing algorithm */
	alg: SigningAlgorithm;
	jwk: ClientAssertionPrivateJwk;
	key: CryptoKey;
	publicJwk: PublicJwk;
}
