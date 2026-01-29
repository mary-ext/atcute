import type { PrivateJwk, PublicJwk, SigningAlgorithm } from '../jwk/types.js';

export type Awaitable<T> = T | Promise<T>;

/**
 * private JWK for DPoP proofs.
 */
export type DpopPrivateJwk = PrivateJwk & {
	alg: SigningAlgorithm;
	kid?: string;
};

/**
 * imported DPoP private key, ready for signing.
 */
export interface DpopPrivateKey {
	jwk: DpopPrivateJwk;
	key: CryptoKey;
	publicJwk: PublicJwk;
}

/**
 * nonce cache for DPoP fetch.
 */
export interface DpopNonceCache {
	get(key: string): Awaitable<string | undefined>;
	set(key: string, value: string): Awaitable<void>;
}
