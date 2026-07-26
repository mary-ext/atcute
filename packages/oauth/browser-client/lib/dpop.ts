import { type DpopPrivateJwk, createDpopProofSigner, sha256Base64Url } from '@atcute/oauth-crypto';

import { database } from './environment.ts';
import { extractContentType } from './utils/response.ts';

/** nonces older than this are assumed stale, matching the reference PDS lifetime */
const NONCE_FRESHNESS = 3 * 60 * 1_000;

/** cap on waiting for another request's nonce, one hung request must not block the origin */
const NONCE_GATE_TIMEOUT = 5_000;

const raceTimeout = async (promise: Promise<void>, ms: number): Promise<void> => {
	let timer: ReturnType<typeof setTimeout> | undefined;

	try {
		await Promise.race([
			promise,
			new Promise<void>((resolve) => {
				timer = setTimeout(resolve, ms);
			}),
		]);
	} finally {
		clearTimeout(timer);
	}
};

export const createDPoPFetch = (dpopKey: DpopPrivateJwk, isAuthServer?: boolean): typeof fetch => {
	const nonces = database.dpopNonces;
	const pending = database.inflightDpop;

	const sign = createDpopProofSigner(dpopKey);

	return async (input, init) => {
		// the construction below consumes a streamed body, leaving nothing to replay
		// on the nonce retry
		const hasUnrepeatableBody =
			init?.body instanceof ReadableStream ||
			(input instanceof Request && init?.body == null && input.body !== null);

		const request = new Request(input, init);

		const authorizationHeader = request.headers.get('authorization');
		const ath = authorizationHeader?.startsWith('DPoP ')
			? await sha256Base64Url(authorizationHeader.slice(5))
			: undefined;

		const { method, url } = request;
		const { origin, pathname } = new URL(url);

		const htu = origin + pathname;

		{
			const inflight = pending.get(origin);
			if (inflight) {
				await raceTimeout(inflight.promise, NONCE_GATE_TIMEOUT);
			}
		}

		let initNonce: string | undefined;
		let expiredOrMissing = false;
		try {
			const [nonce, lapsed] = nonces.getWithLapsed(origin);

			initNonce = nonce;
			expiredOrMissing = lapsed > NONCE_FRESHNESS;
		} catch {
			// ignore read errors
		}

		let gate: PromiseWithResolvers<void> | undefined;
		if (expiredOrMissing) {
			pending.set(origin, (gate = Promise.withResolvers()));
		}

		let nextNonce: string | null;
		try {
			const initProof = await sign(method, htu, initNonce, ath);
			request.headers.set('dpop', initProof);

			const initResponse = await fetch(request);

			nextNonce = initResponse.headers.get('dpop-nonce');

			// re-stamp an unchanged nonce we had written off as stale, otherwise a
			// long-lived one ages out of the freshness window and gates forever
			if (nextNonce !== null && (nextNonce !== initNonce || expiredOrMissing)) {
				try {
					nonces.set(origin, nextNonce);
				} catch {
					// ignore write errors
				}
			}

			if (nextNonce === null || nextNonce === initNonce) {
				return initResponse;
			}

			const shouldRetry = await isUseDpopNonceError(initResponse, isAuthServer);
			if (!shouldRetry) {
				return initResponse;
			}

			if (hasUnrepeatableBody) {
				return initResponse;
			}
		} finally {
			if (gate) {
				// a later request may have installed its own gate after ours timed out
				if (pending.get(origin) === gate) {
					pending.delete(origin);
				}

				gate.resolve();
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
