import { Client, simpleFetchHandler } from '@atcute/client';

// import lexicon types to augment XRPCProcedures
import '../lexicons/index.js';

import type {
	ClientAssertionCredentials,
	ClientAssertionFetcher,
	FetchClientAssertionParams,
} from './types.js';

const CLIENT_ASSERTION_TYPE_JWT_BEARER = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';

/**
 * options for creating a CAB fetcher
 */
export interface CreateCABFetcherOptions {
	/** URL of CAB backend (defaults to location.origin) */
	service?: string | URL;
	/** optional custom fetch implementation */
	fetch?: typeof globalThis.fetch;
}

/**
 * creates a client assertion fetcher that communicates with a CAB backend.
 *
 * the fetcher handles DPoP proof creation and nonce retry automatically.
 *
 * @param options fetcher configuration
 * @returns client assertion fetcher for use with oauth-browser-client
 */
export const createCABFetcher = (options: CreateCABFetcherOptions = {}): ClientAssertionFetcher => {
	const serviceUrl = new URL(options.service ?? location.origin);

	const client = new Client({
		handler: simpleFetchHandler({
			service: serviceUrl,
			fetch: options.fetch,
		}),
	});

	return async (params: FetchClientAssertionParams): Promise<ClientAssertionCredentials> => {
		const { aud, createDpopProof } = params;

		// build the endpoint URL for DPoP proof (htu is origin + pathname only)
		const htu = serviceUrl.origin + '/xrpc/dev.atcute.oauth.getClientAssertion';

		// create initial DPoP proof without nonce
		let dpopProof = await createDpopProof(htu);

		// make the request
		let response = await client.post('dev.atcute.oauth.getClientAssertion', {
			input: { aud },
			headers: { DPoP: dpopProof },
		});

		// check for nonce requirement (UseDpopNonce error)
		if (!response.ok && response.data.error === 'UseDpopNonce') {
			const dpopNonce = response.headers.get('DPoP-Nonce');
			if (dpopNonce) {
				// retry with nonce
				dpopProof = await createDpopProof(htu, dpopNonce);

				response = await client.post('dev.atcute.oauth.getClientAssertion', {
					input: { aud },
					headers: { DPoP: dpopProof },
				});
			}
		}

		if (!response.ok) {
			const message = response.data.message ?? response.data.error ?? 'CAB request failed';
			throw new Error(message);
		}

		const { client_assertion } = response.data;

		return {
			client_assertion,
			client_assertion_type: CLIENT_ASSERTION_TYPE_JWT_BEARER,
		};
	};
};

// re-export types for convenience
export type { ClientAssertionCredentials, ClientAssertionFetcher, FetchClientAssertionParams };
