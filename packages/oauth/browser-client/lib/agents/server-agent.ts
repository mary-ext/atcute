import type { Did } from '@atcute/lexicons';
import { type DpopPrivateJwk, createDpopProofSigner } from '@atcute/oauth-crypto';
import type { AtprotoOAuthTokenResponse, OAuthParResponse } from '@atcute/oauth-types';

import { createDPoPFetch } from '../dpop.ts';
import { CLIENT_ID, REDIRECT_URI, fetchClientAssertion } from '../environment.ts';
import { FetchResponseError, OAuthResponseError, TokenRefreshError } from '../errors.ts';
import { resolveFromIdentifier } from '../resolvers.ts';
import type { PersistedAuthorizationServerMetadata } from '../types/server.ts';
import type { ExchangeInfo, TokenInfo } from '../types/token.ts';
import { pick } from '../utils/misc.ts';
import { extractContentType } from '../utils/response.ts';

export class OAuthServerAgent {
	#fetch: typeof fetch;
	#metadata: PersistedAuthorizationServerMetadata;
	#dpopKey: DpopPrivateJwk;

	constructor(metadata: PersistedAuthorizationServerMetadata, dpopKey: DpopPrivateJwk) {
		this.#metadata = metadata;
		this.#dpopKey = dpopKey;
		this.#fetch = createDPoPFetch(dpopKey, true);
	}

	async request(
		endpoint: 'pushed_authorization_request',
		payload: Record<string, unknown>,
	): Promise<OAuthParResponse>;
	async request(endpoint: 'token', payload: Record<string, unknown>): Promise<AtprotoOAuthTokenResponse>;
	// oxlint-disable-next-line typescript/no-explicit-any
	async request(endpoint: 'revocation', payload: Record<string, unknown>): Promise<any>;
	// oxlint-disable-next-line typescript/no-explicit-any
	async request(endpoint: 'introspection', payload: Record<string, unknown>): Promise<any>;
	// oxlint-disable-next-line typescript/no-explicit-any
	async request(endpoint: string, payload: Record<string, unknown>): Promise<any> {
		// oxlint-disable-next-line typescript/no-explicit-any
		const url: string | undefined = (this.#metadata as any)[`${endpoint}_endpoint`];
		if (!url) {
			throw new Error(`no endpoint for ${endpoint}`);
		}

		if (
			(endpoint === 'token' || endpoint === 'pushed_authorization_request') &&
			fetchClientAssertion !== undefined
		) {
			const sign = createDpopProofSigner(this.#dpopKey);

			const assertion = await fetchClientAssertion({
				aud: this.#metadata.issuer,
				createDpopProof: async (url, nonce) => {
					return await sign('POST', url, nonce, undefined);
				},
			});

			payload = { ...payload, ...assertion };
		}

		const response = await this.#fetch(url, {
			method: 'post',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ ...payload, client_id: CLIENT_ID }),
		});

		if (extractContentType(response.headers) !== 'application/json') {
			throw new FetchResponseError(response, 2, `unexpected content-type`);
		}

		const json = await response.json();

		if (response.ok) {
			return json;
		} else {
			throw new OAuthResponseError(response, json);
		}
	}

	async revoke(token: string): Promise<void> {
		try {
			await this.request('revocation', { token: token });
		} catch {
			/* empty */
		}
	}

	async exchangeCode(code: string, verifier?: string): Promise<{ info: ExchangeInfo; token: TokenInfo }> {
		const response = await this.request('token', {
			grant_type: 'authorization_code',
			redirect_uri: REDIRECT_URI,
			code: code,
			code_verifier: verifier,
		});

		let token: TokenInfo;
		try {
			// a malformed response leaves an unusable grant, hand it back
			token = this.#processTokenResponse(response);
		} catch (err) {
			await this.revoke(response.access_token);
			throw err;
		}

		// kept out of the revoking path above, a transient network failure here must
		// not throw away an otherwise valid grant
		const sub = response.sub;
		const resolved = await resolveFromIdentifier(sub);

		if (resolved.metadata.issuer !== this.#metadata.issuer) {
			await this.revoke(token.access);
			throw new TypeError(`issuer mismatch; got ${resolved.metadata.issuer}`);
		}

		return {
			token: token,
			info: {
				sub: sub,
				aud: resolved.identity.pds,
				server: pick(resolved.metadata, [
					'issuer',
					'authorization_endpoint',
					'introspection_endpoint',
					'pushed_authorization_request_endpoint',
					'revocation_endpoint',
					'token_endpoint',
				]),
			},
		};
	}

	async refresh({ sub, token }: { sub: Did; token: TokenInfo }): Promise<TokenInfo> {
		if (!token.refresh) {
			throw new TokenRefreshError(sub, 'no refresh token available');
		}

		const response = await this.request('token', {
			grant_type: 'refresh_token',
			refresh_token: token.refresh,
		});

		if (sub !== response.sub) {
			throw new TokenRefreshError(sub, `sub mismatch in token response; got ${response.sub}`);
		}

		// not revoked on failure, the refresh token we sent is already spent and the
		// grant may still be recoverable
		return this.#processTokenResponse(response, token);
	}

	#processTokenResponse(res: AtprotoOAuthTokenResponse, previous?: TokenInfo): TokenInfo {
		if (!res.sub) {
			throw new TypeError(`missing sub field in token response`);
		}
		if (!res.scope) {
			throw new TypeError(`missing scope field in token response`);
		}
		if (res.token_type !== 'DPoP') {
			throw new TypeError(`token response returned a non-dpop token`);
		}

		return {
			scope: res.scope,
			// RFC 6749 §6, the refresh token is only replaced when a new one is issued
			refresh: res.refresh_token ?? previous?.refresh,
			access: res.access_token,
			type: res.token_type,
			expires_at: typeof res.expires_in === 'number' ? Date.now() + res.expires_in * 1_000 : undefined,
		};
	}
}
