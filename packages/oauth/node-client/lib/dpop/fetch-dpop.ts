import { type JWK, SignJWT } from 'jose';
import { nanoid } from 'nanoid';

import { sha256 } from '../utils/crypto.js';
import type { Store } from '../utils/store.js';

/** DPoP nonce cache, keyed by origin */
export type DpopNonceCache = Store<string, string>;

/** cache for derived public JWKs */
const publicJwkCache = new WeakMap<JWK, JWK>();

/**
 * derives the public JWK from a private JWK, with caching.
 */
const getPublicJwk = (privateJwk: JWK): JWK => {
	let publicJwk = publicJwkCache.get(privateJwk);
	if (!publicJwk) {
		const { kty } = privateJwk;

		if (kty === 'EC') {
			const { alg, crv, x, y } = privateJwk as JWK & { crv: string; x: string; y: string };
			publicJwk = { kty, alg, crv, x, y };
		} else if (kty === 'RSA') {
			const { alg, n, e } = privateJwk as JWK & { n: string; e: string };
			publicJwk = { kty, alg, n, e };
		} else if (kty === 'OKP') {
			const { alg, crv, x } = privateJwk as JWK & { crv: string; x: string };
			publicJwk = { kty, alg, crv, x };
		} else {
			throw new Error(`unsupported key type: ${kty}`);
		}

		publicJwkCache.set(privateJwk, publicJwk);
	}

	return publicJwk;
};

export interface DpopFetchOptions {
	/** DPoP private key (JWK with `alg` set) */
	key: JWK;
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
	const { key, nonces, supportedAlgs, isAuthServer, fetch = globalThis.fetch } = options;

	// negotiate/validate algorithm
	const alg = negotiateAlg(key, supportedAlgs);

	return async (input, init) => {
		const request: Request = init == null && input instanceof Request ? input : new Request(input, init);

		// compute ath (access token hash) if Authorization header has DPoP token
		const authHeader = request.headers.get('Authorization');
		const ath = authHeader?.startsWith('DPoP ') ? await sha256(authHeader.slice(5)) : undefined;

		const { origin } = new URL(request.url);
		const htm = request.method;
		const htu = buildHtu(request.url);

		// get cached nonce for this origin
		let initNonce: string | undefined;
		try {
			initNonce = await nonces.get(origin);
		} catch {
			// ignore get errors
		}

		// build and send initial request with DPoP proof
		const initProof = await buildProof(key, alg, htm, htu, initNonce, ath);
		request.headers.set('DPoP', initProof);

		const initResponse = await fetch(request);

		// check for new nonce in response
		const nextNonce = initResponse.headers.get('DPoP-Nonce');
		if (!nextNonce || nextNonce === initNonce) {
			return initResponse;
		}

		// store the new nonce
		try {
			await nonces.set(origin, nextNonce);
		} catch {
			// ignore set errors
		}

		// check if we need to retry with the new nonce
		const shouldRetry = await isUseDpopNonceError(initResponse, isAuthServer);
		if (!shouldRetry) {
			return initResponse;
		}

		// can't retry if request body was already consumed
		if (input === request) {
			return initResponse;
		}
		if (init?.body instanceof ReadableStream) {
			return initResponse;
		}

		// consume the initial response body before retrying
		await initResponse.body?.cancel();

		// retry with the new nonce
		const nextProof = await buildProof(key, alg, htm, htu, nextNonce, ath);
		const nextRequest = new Request(input, init);
		nextRequest.headers.set('DPoP', nextProof);

		const retryResponse = await fetch(nextRequest);

		// update nonce from retry response if present
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

/**
 * strips query string and fragment from URL for the `htu` claim.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9449.html#section-4.2-4.6}
 */
const buildHtu = (url: string): string => {
	const fragmentIdx = url.indexOf('#');
	const queryIdx = url.indexOf('?');

	const end = fragmentIdx === -1 ? queryIdx : queryIdx === -1 ? fragmentIdx : Math.min(fragmentIdx, queryIdx);

	return end === -1 ? url : url.slice(0, end);
};

/**
 * builds a DPoP proof JWT.
 */
const buildProof = async (
	key: JWK,
	alg: string,
	htm: string,
	htu: string,
	nonce?: string,
	ath?: string,
): Promise<string> => {
	const now = Math.floor(Date.now() / 1_000);

	return new SignJWT({
		htm,
		htu,
		iat: now,
		jti: nanoid(24),
		nonce,
		ath,
	})
		.setProtectedHeader({
			alg,
			typ: 'dpop+jwt',
			jwk: getPublicJwk(key),
		})
		.sign(key);
};

/**
 * negotiates the DPoP signing algorithm based on key and server support.
 */
const negotiateAlg = (key: JWK, supportedAlgs?: readonly string[]): string => {
	const keyAlg = key.alg;
	if (!keyAlg) {
		throw new Error(`DPoP key must have 'alg' field set`);
	}

	if (supportedAlgs?.length) {
		if (supportedAlgs.includes(keyAlg)) {
			return keyAlg;
		}
		throw new Error(`DPoP key algorithm ${keyAlg} not supported by server: ${supportedAlgs.join(', ')}`);
	}
	return keyAlg;
};

/**
 * checks if the response is a `use_dpop_nonce` error.
 */
const isUseDpopNonceError = async (response: Response, isAuthServer?: boolean): Promise<boolean> => {
	// resource server: WWW-Authenticate header with use_dpop_nonce error
	// https://datatracker.ietf.org/doc/html/rfc6750#section-3
	// https://datatracker.ietf.org/doc/html/rfc9449#name-resource-server-provided-no
	if (isAuthServer === undefined || isAuthServer === false) {
		if (response.status === 401) {
			const wwwAuth = response.headers.get('WWW-Authenticate');
			if (wwwAuth?.startsWith('DPoP')) {
				return wwwAuth.includes('error="use_dpop_nonce"');
			}
		}
	}

	// authorization server: JSON body with error field
	// https://datatracker.ietf.org/doc/html/rfc9449#name-authorization-server-provid
	if (isAuthServer === undefined || isAuthServer === true) {
		if (response.status === 400) {
			try {
				// clone to preserve body for caller
				const json = await response.clone().json();
				return typeof json === 'object' && json?.error === 'use_dpop_nonce';
			} catch {
				return false;
			}
		}
	}

	return false;
};
