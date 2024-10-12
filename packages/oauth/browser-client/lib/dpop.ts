import { nanoid } from 'nanoid/non-secure';

import { database } from './environment.js';
import type { DPoPKey } from './types/dpop.js';
import { extractContentType } from './utils/response.js';
import { encoder, fromBase64Url, toBase64Url, toSha256 } from './utils/runtime.js';

const ES256_ALG = { name: 'ECDSA', namedCurve: 'P-256' } as const;

export const createES256Key = async (): Promise<DPoPKey> => {
	const pair = await crypto.subtle.generateKey(ES256_ALG, true, ['sign', 'verify']);

	const key = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
	const { ext: _ext, key_ops: _key_opts, ...jwk } = await crypto.subtle.exportKey('jwk', pair.publicKey);

	return {
		typ: 'ES256',
		key: toBase64Url(new Uint8Array(key)),
		jwt: toBase64Url(encoder.encode(JSON.stringify({ typ: 'dpop+jwt', alg: 'ES256', jwk: jwk }))),
	};
};

export const createDPoPSignage = (issuer: string, dpopKey: DPoPKey) => {
	const headerString = dpopKey.jwt;
	const keyPromise = crypto.subtle.importKey('pkcs8', fromBase64Url(dpopKey.key), ES256_ALG, true, ['sign']);

	const constructPayload = (
		method: string,
		url: string,
		nonce: string | undefined,
		ath: string | undefined,
	) => {
		const now = (Date.now() / 1_000) | 0;

		const payload = {
			iss: issuer,
			iat: now,
			// This seems fine, we can remake the request if it fails.
			jti: nanoid(12),
			htm: method,
			htu: url,
			nonce: nonce,
			ath: ath,
		};

		return toBase64Url(encoder.encode(JSON.stringify(payload)));
	};

	return async (method: string, url: string, nonce: string | undefined, ath: string | undefined) => {
		const payloadString = constructPayload(method, url, nonce, ath);

		const signed = await crypto.subtle.sign(
			{ name: 'ECDSA', hash: { name: 'SHA-256' } },
			await keyPromise,
			encoder.encode(headerString + '.' + payloadString),
		);

		const signatureString = toBase64Url(new Uint8Array(signed));

		return headerString + '.' + payloadString + '.' + signatureString;
	};
};

export const createDPoPFetch = (issuer: string, dpopKey: DPoPKey, isAuthServer?: boolean): typeof fetch => {
	const nonces = database.dpopNonces;
	const sign = createDPoPSignage(issuer, dpopKey);

	return async (input, init) => {
		const request: Request = init == null && input instanceof Request ? input : new Request(input, init);

		const authorizationHeader = request.headers.get('authorization');
		const ath = authorizationHeader?.startsWith('DPoP ')
			? await toSha256(authorizationHeader.slice(5))
			: undefined;

		const { method, url } = request;
		const { origin } = new URL(url);

		let initNonce: string | undefined;
		try {
			initNonce = nonces.get(origin);
		} catch {
			// Ignore get errors, we will just not send a nonce
		}

		const initProof = await sign(method, url, initNonce, ath);
		request.headers.set('dpop', initProof);

		const initResponse = await fetch(request);

		const nextNonce = initResponse.headers.get('dpop-nonce');
		if (!nextNonce || nextNonce === initNonce) {
			// No nonce was returned or it is the same as the one we sent. No need to
			// update the nonce store, or retry the request.
			return initResponse;
		}

		// Store the fresh nonce for future requests
		try {
			nonces.set(origin, nextNonce);
		} catch {
			// Ignore set errors
		}

		const shouldRetry = await isUseDpopNonceError(initResponse, isAuthServer);
		if (!shouldRetry) {
			// Not a "use_dpop_nonce" error, so there is no need to retry
			return initResponse;
		}

		// If the input stream was already consumed, we cannot retry the request. A
		// solution would be to clone() the request but that would bufferize the
		// entire stream in memory which can lead to memory starvation. Instead, we
		// will return the original response and let the calling code handle retries.

		if (input === request || init?.body instanceof ReadableStream) {
			return initResponse;
		}

		const nextProof = await sign(method, url, nextNonce, ath);
		const nextRequest = new Request(input, init);
		nextRequest.headers.set('dpop', nextProof);

		return await fetch(nextRequest);
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
