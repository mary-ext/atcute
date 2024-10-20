import type { At } from '@atcute/client/lexicons';

import { createDPoPFetch } from '../dpop.js';
import { CLIENT_ID, REDIRECT_URI } from '../environment.js';
import { FetchResponseError, OAuthResponseError, TokenRefreshError } from '../errors.js';
import { resolveFromIdentity } from '../resolvers.js';
import type { DPoPKey } from '../types/dpop.js';
import type { OAuthParResponse } from '../types/par.js';
import type { PersistedAuthorizationServerMetadata } from '../types/server.js';
import type { ExchangeInfo, OAuthTokenResponse, TokenInfo } from '../types/token.js';
import { pick } from '../utils/misc.js';
import { extractContentType } from '../utils/response.js';

export class OAuthServerAgent {
	#fetch: typeof fetch;
	#metadata: PersistedAuthorizationServerMetadata;

	constructor(metadata: PersistedAuthorizationServerMetadata, dpopKey: DPoPKey) {
		this.#metadata = metadata;
		this.#fetch = createDPoPFetch(CLIENT_ID, dpopKey, true);
	}

	async request(
		endpoint: 'pushed_authorization_request',
		payload: Record<string, unknown>,
	): Promise<OAuthParResponse>;
	async request(endpoint: 'token', payload: Record<string, unknown>): Promise<OAuthTokenResponse>;
	async request(endpoint: 'revocation', payload: Record<string, unknown>): Promise<any>;
	async request(endpoint: 'introspection', payload: Record<string, unknown>): Promise<any>;
	async request(endpoint: string, payload: Record<string, unknown>): Promise<any> {
		const url: string | undefined = (this.#metadata as any)[`${endpoint}_endpoint`];
		if (!url) {
			throw new Error(`no endpoint for ${endpoint}`);
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
		} catch {}
	}

	async exchangeCode(code: string, verifier?: string): Promise<{ info: ExchangeInfo; token: TokenInfo }> {
		const response = await this.request('token', {
			grant_type: 'authorization_code',
			redirect_uri: REDIRECT_URI,
			code: code,
			code_verifier: verifier,
		});

		try {
			return await this.#processExchangeResponse(response);
		} catch (err) {
			await this.revoke(response.access_token);
			throw err;
		}
	}

	async refresh({ sub, token }: { sub: At.DID; token: TokenInfo }): Promise<TokenInfo> {
		if (!token.refresh) {
			throw new TokenRefreshError(sub, 'no refresh token available');
		}

		const response = await this.request('token', {
			grant_type: 'refresh_token',
			refresh_token: token.refresh,
		});

		try {
			if (sub !== response.sub) {
				throw new TokenRefreshError(sub, `sub mismatch in token response; got ${response.sub}`);
			}

			return this.#processTokenResponse(response);
		} catch (err) {
			await this.revoke(response.access_token);

			throw err;
		}
	}

	#processTokenResponse(res: OAuthTokenResponse): TokenInfo {
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
			refresh: res.refresh_token,
			access: res.access_token,
			type: res.token_type,
			expires_at: typeof res.expires_in === 'number' ? Date.now() + res.expires_in * 1_000 : undefined,
		};
	}

	async #processExchangeResponse(res: OAuthTokenResponse): Promise<{ info: ExchangeInfo; token: TokenInfo }> {
		const sub = res.sub;
		if (!sub) {
			throw new TypeError(`missing sub field in token response`);
		}

		const token = this.#processTokenResponse(res);
		const resolved = await resolveFromIdentity(sub);

		if (resolved.metadata.issuer !== this.#metadata.issuer) {
			throw new TypeError(`issuer mismatch; got ${resolved.metadata.issuer}`);
		}

		return {
			token: token,
			info: {
				sub: sub as At.DID,
				aud: resolved.identity.pds.href,
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
}
