import type { DpopPrivateJwk } from '@atcute/oauth-crypto';
import { createDpopFetch as createDpopFetchInternal, importDpopPrivateJwk } from '@atcute/oauth-crypto';

import type { Store } from '../utils/store.js';

/** DPoP nonce cache, keyed by origin */
export type DpopNonceCache = Store<string, string>;

export interface DpopFetchOptions {
	/** DPoP private key (JWK with `alg` set) */
	key: DpopPrivateJwk;
	/** nonce store, keyed by origin */
	nonces: DpopNonceCache;
	/** server's supported DPoP signing algorithms */
	supportedAlgs?: readonly string[];
	/**
	 * is the target an authorization server (true) or resource server (false)?
	 * affects how `use_dpop_nonce` errors are detected.
	 */
	isAuthServer?: boolean;
	/** custom fetch implementation */
	fetch?: typeof globalThis.fetch;
}

/**
 * creates a fetch wrapper that adds DPoP proofs to requests.
 *
 * @param options DPoP configuration
 * @returns fetch function with DPoP support
 */
export const createDpopFetch = (options: DpopFetchOptions): typeof globalThis.fetch => {
	const { key, nonces, supportedAlgs, isAuthServer, fetch } = options;

	// validate alg synchronously to match oauth-crypto behavior
	const keyAlg = key.alg;
	if (!keyAlg) {
		throw new Error(`DPoP key must have 'alg' field set`);
	}
	if (supportedAlgs?.length && !supportedAlgs.includes(keyAlg)) {
		throw new Error(`DPoP key algorithm ${keyAlg} not supported by server: ${supportedAlgs.join(', ')}`);
	}

	const fetchPromise = importDpopPrivateJwk(key).then((dpopKey) => {
		return createDpopFetchInternal({
			key: dpopKey,
			nonces: nonces,
			supportedAlgs,
			isAuthServer,
			fetch,
		});
	});

	return async (input, init) => {
		const dpopFetch = await fetchPromise;
		return dpopFetch(input, init);
	};
};
