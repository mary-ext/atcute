import type { FetchHandlerObject } from '@atcute/client';
import type { Did } from '@atcute/lexicons';
import { createDpopFetch } from '@atcute/oauth-crypto';
import type { AtprotoOAuthScope } from '@atcute/oauth-types';

import { TokenInvalidError, TokenRevokedError } from './errors.js';
import type { OAuthServerAgent } from './oauth-server-agent.js';
import type { SessionGetter } from './session-getter.js';
import type { TokenSet } from './types/token-set.js';

/**
 * token information for external use.
 */
export interface TokenInfo {
	/** token expiration time */
	expiresAt?: Date;
	/** whether the token is expired */
	expired?: boolean;
	/** granted scope */
	scope: AtprotoOAuthScope;
	/** authorization server issuer */
	iss: string;
	/** resource server (PDS) URL */
	aud: string;
	/** user's DID */
	sub: Did;
}

/**
 * represents an authenticated user session.
 *
 * provides methods for making authenticated requests to the user's PDS
 * and managing the session lifecycle.
 */
export class OAuthSession implements FetchHandlerObject {
	private readonly dpopFetch: typeof globalThis.fetch;

	constructor(
		/** server agent for this session's AS */
		readonly server: OAuthServerAgent,
		/** user's DID */
		readonly sub: Did,
		/** session getter for token management */
		private readonly sessionGetter: SessionGetter,
		fetch: typeof globalThis.fetch = globalThis.fetch,
	) {
		this.dpopFetch = createDpopFetch({
			key: server.dpopKey,
			nonces: server.dpopNonces,
			supportedAlgs: server.serverMetadata.dpop_signing_alg_values_supported,
			isAuthServer: false,
			fetch,
		});
	}

	/**
	 * user's DID.
	 */
	get did(): Did {
		return this.sub;
	}

	/**
	 * gets the current token set.
	 *
	 * @param refresh true to force refresh, false to allow stale, 'auto' for normal
	 * @returns current token set
	 */
	private async getTokenSet(refresh: boolean | 'auto'): Promise<TokenSet> {
		const { tokenSet } = await this.sessionGetter.getSession(this.sub, refresh);
		return tokenSet;
	}

	/**
	 * gets information about the current token.
	 *
	 * @param refresh true to force refresh, false to allow stale, 'auto' for normal
	 * @returns token information
	 */
	async getTokenInfo(refresh: boolean | 'auto' = 'auto'): Promise<TokenInfo> {
		const tokenSet = await this.getTokenSet(refresh);
		const expiresAt = tokenSet.expires_at != null ? new Date(tokenSet.expires_at) : undefined;

		return {
			expiresAt,
			get expired() {
				return expiresAt != null ? expiresAt.getTime() < Date.now() - 5_000 : undefined;
			},
			scope: tokenSet.scope,
			iss: tokenSet.iss,
			aud: tokenSet.aud,
			sub: tokenSet.sub,
		};
	}

	/**
	 * signs out and revokes the session.
	 */
	async signOut(): Promise<void> {
		try {
			const tokenSet = await this.getTokenSet(false);
			await this.server.revoke(tokenSet.access_token);
		} finally {
			await this.sessionGetter.deleteStored(this.sub, new TokenRevokedError(this.sub));
		}
	}

	/**
	 * makes an authenticated request to the user's PDS.
	 *
	 * automatically refreshes tokens if needed and retries on auth failure.
	 *
	 * @param pathname path relative to the PDS URL
	 * @param init fetch init options
	 * @returns fetch response
	 */
	async handle(pathname: string, init?: RequestInit): Promise<Response> {
		// try with current token (auto-refresh if stale)
		const tokenSet = await this.getTokenSet('auto');

		const initialUrl = new URL(pathname, tokenSet.aud);
		const initialAuth = `${tokenSet.token_type} ${tokenSet.access_token}`;

		const headers = new Headers(init?.headers);
		headers.set('Authorization', initialAuth);

		const initialResponse = await this.dpopFetch(initialUrl, { ...init, headers });

		// if not an auth error, return as-is
		if (!isInvalidTokenResponse(initialResponse)) {
			return initialResponse;
		}

		// try forcing a refresh
		let freshTokenSet: TokenSet;
		try {
			freshTokenSet = await this.getTokenSet(true);
		} catch {
			// refresh failed, return original response
			return initialResponse;
		}

		// can't retry if body was a stream (already consumed)
		if (init?.body instanceof ReadableStream) {
			return initialResponse;
		}

		// retry with fresh token
		const freshUrl = new URL(pathname, freshTokenSet.aud);
		const freshAuth = `${freshTokenSet.token_type} ${freshTokenSet.access_token}`;

		headers.set('Authorization', freshAuth);

		const freshResponse = await this.dpopFetch(freshUrl, { ...init, headers });

		// if still failing after refresh, the session is likely invalid
		if (isInvalidTokenResponse(freshResponse)) {
			await this.sessionGetter.deleteStored(this.sub, new TokenInvalidError(this.sub));
		}

		return freshResponse;
	}
}

/**
 * checks if a response indicates an invalid token.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6750#section-3}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9449#name-resource-server-provided-no}
 */
const isInvalidTokenResponse = (response: Response): boolean => {
	if (response.status !== 401) {
		return false;
	}

	const wwwAuth = response.headers.get('WWW-Authenticate');
	if (wwwAuth == null) {
		return false;
	}

	return (
		(wwwAuth.startsWith('Bearer ') || wwwAuth.startsWith('DPoP ')) &&
		wwwAuth.includes('error="invalid_token"')
	);
};
