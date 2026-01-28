import type { PrivateJwk, PublicJwk, SigningAlgorithm } from '../jwk/types.js';

export type Awaitable<T> = T | Promise<T>;

/**
 * private jwk for dpop proofs.
 */
export type DpopPrivateJwk = PrivateJwk & {
	alg: SigningAlgorithm;
	kid?: string;
};

/**
 * imported dpop private key, ready for signing.
 */
export interface DpopPrivateKey {
	jwk: DpopPrivateJwk;
	key: CryptoKey;
	publicJwk: PublicJwk;
}

/**
 * nonce cache for dpop fetch.
 */
export interface DpopNonceCache {
	get(key: string): Awaitable<string | undefined>;
	set(key: string, value: string): Awaitable<void>;
}
