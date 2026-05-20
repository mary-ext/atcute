import { type DpopPrivateJwk, createDpopProofSigner, sha256Base64Url } from '@atcute/oauth-crypto';

import { database } from './environment.ts';
import { extractContentType } from './utils/response.ts';

export const createDPoPFetch = (dpopKey: DpopPrivateJwk, isAuthServer?: boolean): typeof fetch => {
	const nonces = database.dpopNonces;
	const pending = database.inflightDpop;

	const sign = createDpopProofSigner(dpopKey);

	return async (input, init) => {
		const request = new Request(input, init);

		const authorizationHeader = request.headers.get('authorization');
		const ath = authorizationHeader?.startsWith('DPoP ')
			? await sha256Base64Url(authorizationHeader.slice(5))
			: undefined;

		const { method, url } = request;
		const { origin, pathname } = new URL(url);

		const htu = origin + pathname;

		let deferred = pending.get(origin);
		if (deferred) {
			await deferred.promise;
			deferred = undefined;
		}

		let initNonce: string | undefined;
		let expiredOrMissing = false;
		try {
			const [nonce, lapsed] = nonces.getWithLapsed(origin);

			initNonce = nonce;
			expiredOrMissing = lapsed > 3 * 60 * 1_000;
		} catch {
			// ignore read errors
		}

		if (expiredOrMissing) {
			pending.set(origin, (deferred = Promise.withResolvers()));
		}

		let nextNonce: string | null;
		try {
			const initProof = await sign(method, htu, initNonce, ath);
			request.headers.set('dpop', initProof);

			const initResponse = await fetch(request);

			nextNonce = initResponse.headers.get('dpop-nonce');
			if (nextNonce === null || nextNonce === initNonce) {
				return initResponse;
			}

			try {
				nonces.set(origin, nextNonce);
			} catch {
				// ignore write errors
			}

			const shouldRetry = await isUseDpopNonceError(initResponse, isAuthServer);
			if (!shouldRetry) {
				return initResponse;
			}

			if (input === request || init?.body instanceof ReadableStream) {
				return initResponse;
			}
		} finally {
			if (deferred) {
				pending.delete(origin);
				deferred.resolve();
			}
		}

		{
			const nextProof = await sign(method, htu, nextNonce, ath);
			const nextRequest = new Request(input, init);
			nextRequest.headers.set('dpop', nextProof);

			const retryResponse = await fetch(nextRequest);

			const retryNonce = retryResponse.headers.get('dpop-nonce');
			if (retryNonce !== null && retryNonce !== nextNonce) {
				try {
					nonces.set(origin, retryNonce);
				} catch {
					// ignore write errors
				}
			}

			return retryResponse;
		}
	};
};

const isUseDpopNonceError = async (response: Response, isAuthServer?: boolean): Promise<boolean> => {
	if (isAuthServer === undefined || isAuthServer === false) {
		if (response.status === 401) {
			const wwwAuth = response.headers.get('www-authenticate');
			if (wwwAuth?.startsWith('DPoP')) {
				return wwwAuth.includes('error="use_dpop_nonce"');
			}
		}
	}

	if (isAuthServer === undefined || isAuthServer === true) {
		if (response.status === 400 && extractContentType(response.headers) === 'application/json') {
			try {
				const json = await response.clone().json();
				return typeof json === 'object' && json?.['error'] === 'use_dpop_nonce';
			} catch {
				return false;
			}
		}
	}

	return false;
};
