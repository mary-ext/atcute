import type { PrivateJwk, SigningAlgorithm } from '../jwk/types.ts';

export type Awaitable<T> = T | Promise<T>;

/** private JWK for DPoP proofs. */
export type DpopPrivateJwk = PrivateJwk & {
	alg: SigningAlgorithm;
	kid?: string;
};

/** nonce cache for DPoP fetch. */
export interface DpopNonceCache {
	get(key: string): Awaitable<string | undefined>;
	set(key: string, value: string): Awaitable<void>;
}
