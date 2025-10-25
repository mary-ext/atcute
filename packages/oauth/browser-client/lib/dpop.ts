import { fromBase64Url, toBase64Url } from '@atcute/multibase';
import { encodeUtf8 } from '@atcute/uint8array';

import { nanoid } from 'nanoid';

import { database } from './environment.js';
import type { DPoPKey } from './types/dpop.js';
import { extractContentType } from './utils/response.js';
import { stringToSha256 } from './utils/runtime.js';

const ES256_ALG = { name: 'ECDSA', namedCurve: 'P-256' } as const;

export const createES256Key = async (): Promise<DPoPKey> => {
	const pair = await crypto.subtle.generateKey(ES256_ALG, true, ['sign', 'verify']);

	const key = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
	const { ext: _ext, key_ops: _key_opts, ...jwk } = await crypto.subtle.exportKey('jwk', pair.publicKey);

	const canonicalJwk = JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y });
	const jkt = await stringToSha256(canonicalJwk);

	return {
		typ: 'ES256',
		key: toBase64Url(new Uint8Array(key)),
		jwt: toBase64Url(encodeUtf8(JSON.stringify({ typ: 'dpop+jwt', alg: 'ES256', jwk: jwk }))),
		jkt: jkt,
	};
};

export const createDPoPSignage = (dpopKey: DPoPKey) => {
	const headerString = dpopKey.jwt;
	const keyPromise = crypto.subtle.importKey(
		'pkcs8',
		fromBase64Url(dpopKey.key) as Uint8Array<ArrayBuffer>,
		ES256_ALG,
		true,
		['sign'],
	);

	const constructPayload = (htm: string, htu: string, nonce: string | undefined, ath: string | undefined) => {
		const payload = {
			ath: ath,
			htm: htm,
			htu: htu,
			iat: Math.floor(Date.now() / 1_000),
			jti: nanoid(24),
			nonce: nonce,
		};

		return toBase64Url(encodeUtf8(JSON.stringify(payload)));
	};

	return async (method: string, htu: string, nonce: string | undefined, ath: string | undefined) => {
		const payloadString = constructPayload(method, htu, nonce, ath);

		const signed = await crypto.subtle.sign(
			{ name: 'ECDSA', hash: { name: 'SHA-256' } },
			await keyPromise,
			encodeUtf8(headerString + '.' + payloadString) as Uint8Array<ArrayBuffer>,
		);

		const signatureString = toBase64Url(new Uint8Array(signed));

		return headerString + '.' + payloadString + '.' + signatureString;
	};
};

export const createDPoPFetch = (dpopKey: DPoPKey, isAuthServer?: boolean): typeof fetch => {
	const nonces = database.dpopNonces;
	const pending = database.inflightDpop;

	const sign = createDPoPSignage(dpopKey);

	return async (input, init) => {
		const request = new Request(input, init);

		const authorizationHeader = request.headers.get('authorization');
		const ath = authorizationHeader?.startsWith('DPoP ')
			? await stringToSha256(authorizationHeader.slice(5))
			: undefined;

		const { method, url } = request;
		const { origin, pathname } = new URL(url);

		const htu = origin + pathname;

		// See if we have a pending promise for this origin, we'll await before
		// proceeding with this request, next comment describes what the promise
		// is meant to be.
		let deferred = pending.get(origin);
		if (deferred) {
			await deferred.promise;
			deferred = undefined;
		}

		// Get our persisted nonce value for this origin
		let initNonce: string | undefined;
		let expiredOrMissing = false;
		try {
			const [nonce, lapsed] = nonces.getWithLapsed(origin);

			initNonce = nonce;

			// The problem with DPoP nonces is that we don't have insight as to when
			// they'll expire, either we have a nonce value or we don't.
			//
			// Which is very unfortunate, if the client makes multiple requests at the
			// same time, there's a chance that all of them will fail due to the nonce
			// value having expired.
			//
			// To make this less painful, if it's been over 3 minutes since we last
			// had a nonce value, or we never had one to begin with, we'll let this
			// request through and defer everyone else until we get a possibly fresh
			// nonce value.
			//
			// 3 minutes being the DPoP nonce expiration time set by the reference PDS
			// implementation.
			expiredOrMissing = lapsed > 3 * 60 * 1_000;
		} catch {
			// Ignore read errors, we'll just act like we're missing a nonce.
		}

		if (expiredOrMissing) {
			// Defer everyone else until this request finishes.
			pending.set(origin, (deferred = Promise.withResolvers()));
		}

		let nextNonce: string | null;
		try {
			const initProof = await sign(method, htu, initNonce, ath);
			request.headers.set('dpop', initProof);

			const initResponse = await fetch(request);

			nextNonce = initResponse.headers.get('dpop-nonce');
			if (nextNonce === null || nextNonce === initNonce) {
				// No nonce was returned or it is the same as the one we sent. No need to
				// update the nonce store, or retry the request.

				return initResponse;
			}

			// Store the fresh nonce for future requests
			try {
				nonces.set(origin, nextNonce);
			} catch {
				// Ignore write errors
			}

			const shouldRetry = await isUseDpopNonceError(initResponse, isAuthServer);
			if (!shouldRetry) {
				// Not a "use_dpop_nonce" error, so there is no need to retry

				return initResponse;
			}

			if (input === request || init?.body instanceof ReadableStream) {
				// If the input stream was already consumed, we cannot retry the request. A
				// solution would be to clone() the request but that would bufferize the
				// entire stream in memory which can lead to memory starvation. Instead, we
				// will return the original response and let the calling code handle retries.

				return initResponse;
			}
		} finally {
			// Now everyone can have their turn.
			if (deferred) {
				pending.delete(origin);
				deferred.resolve();
			}
		}

		// We got here because we were asked to retry the request (due to missing
		// nonce value in the first request), let's do just that.
		{
			const nextProof = await sign(method, htu, nextNonce, ath);
			const nextRequest = new Request(input, init);
			nextRequest.headers.set('dpop', nextProof);

			const retryResponse = await fetch(nextRequest);

			// Check if the server returned another new nonce in the retry response
			const retryNonce = retryResponse.headers.get('dpop-nonce');
			if (retryNonce !== null && retryNonce !== nextNonce) {
				try {
					nonces.set(origin, retryNonce);
				} catch {
					// Ignore write errors
				}
			}

			return retryResponse;
		}
	};
};

const isUseDpopNonceError = async (response: Response, isAuthServer?: boolean): Promise<boolean> => {
	// https://datatracker.ietf.org/doc/html/rfc6750#section-3
	// https://datatracker.ietf.org/doc/html/rfc9449#name-resource-server-provided-no
	if (isAuthServer === undefined || isAuthServer === false) {
		if (response.status === 401) {
			const wwwAuth = response.headers.get('www-authenticate');
			if (wwwAuth?.startsWith('DPoP')) {
				return wwwAuth.includes('error="use_dpop_nonce"');
			}
		}
	}

	// https://datatracker.ietf.org/doc/html/rfc9449#name-authorization-server-provid
	if (isAuthServer === undefined || isAuthServer === true) {
		if (response.status === 400 && extractContentType(response.headers) === 'application/json') {
			try {
				const json = await response.clone().json();
				return typeof json === 'object' && json?.['error'] === 'use_dpop_nonce';
			} catch {
				// Response too big (to be "use_dpop_nonce" error) or invalid JSON
				return false;
			}
		}
	}

	return false;
};
