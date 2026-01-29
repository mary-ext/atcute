import { sha256Base64Url } from '../hash/sha256.js';

import { createDpopProofSigner } from './proof.js';
import type { DpopPrivateJwk, DpopNonceCache } from './types.js';

export interface CreateDpopFetchOptions {
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
export const createDpopFetch = (options: CreateDpopFetchOptions): typeof globalThis.fetch => {
	const { key, nonces, supportedAlgs, isAuthServer, fetch = globalThis.fetch } = options;

	negotiateAlg(key, supportedAlgs);
	const sign = createDpopProofSigner(key);

	return async (input, init) => {
		const request: Request = init == null && input instanceof Request ? input : new Request(input, init);

		const authHeader = request.headers.get('Authorization');
		const ath = authHeader?.startsWith('DPoP ') ? await sha256Base64Url(authHeader.slice(5)) : undefined;

		const { origin } = new URL(request.url);
		const htm = request.method;
		const htu = buildHtu(request.url);

		let initNonce: string | undefined;
		try {
			initNonce = await nonces.get(origin);
		} catch {
			// ignore get errors
		}

		const initProof = await sign(htm, htu, initNonce, ath);
		request.headers.set('DPoP', initProof);

		const initResponse = await fetch(request);

		const nextNonce = initResponse.headers.get('DPoP-Nonce');
		if (!nextNonce || nextNonce === initNonce) {
			return initResponse;
		}

		try {
			await nonces.set(origin, nextNonce);
		} catch {
			// ignore set errors
		}

		const shouldRetry = await isUseDpopNonceError(initResponse, isAuthServer);
		if (!shouldRetry) {
			return initResponse;
		}

		if (input === request || init?.body instanceof ReadableStream) {
			return initResponse;
		}

		await initResponse.body?.cancel();

		const nextProof = await sign(htm, htu, nextNonce, ath);
		const nextRequest = new Request(input, init);
		nextRequest.headers.set('DPoP', nextProof);

		const retryResponse = await fetch(nextRequest);

		const retryNonce = retryResponse.headers.get('DPoP-Nonce');
		if (retryNonce && retryNonce !== nextNonce) {
			try {
				await nonces.set(origin, retryNonce);
			} catch {
				// ignore set errors
			}
		}

		return retryResponse;
	};
};

const buildHtu = (url: string): string => {
	const fragmentIdx = url.indexOf('#');
	const queryIdx = url.indexOf('?');
	const end = fragmentIdx === -1 ? queryIdx : queryIdx === -1 ? fragmentIdx : Math.min(fragmentIdx, queryIdx);

	return end === -1 ? url : url.slice(0, end);
};

const negotiateAlg = (key: DpopPrivateJwk, supportedAlgs?: readonly string[]): string => {
	const keyAlg = key.alg;

	if (supportedAlgs?.length) {
		if (supportedAlgs.includes(keyAlg)) {
			return keyAlg;
		}
		throw new Error(`DPoP key algorithm ${keyAlg} not supported by server: ${supportedAlgs.join(', ')}`);
	}

	return keyAlg;
};

const isUseDpopNonceError = async (response: Response, isAuthServer?: boolean): Promise<boolean> => {
	if (isAuthServer === undefined || isAuthServer === false) {
		if (response.status === 401) {
			const wwwAuth = response.headers.get('WWW-Authenticate');
			if (wwwAuth?.startsWith('DPoP')) {
				return wwwAuth.includes('error="use_dpop_nonce"');
			}
		}
	}

	if (isAuthServer === undefined || isAuthServer === true) {
		if (response.status === 400) {
			try {
				const json = await response.clone().json();
				return typeof json === 'object' && json?.error === 'use_dpop_nonce';
			} catch {
				return false;
			}
		}
	}

	return false;
};
