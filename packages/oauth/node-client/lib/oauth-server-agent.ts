import type { JWK } from 'jose';

import type { Did } from '@atcute/lexicons';
import {
	atprotoOAuthTokenResponseSchema,
	oauthParResponseSchema,
	type AtprotoAuthorizationServerMetadata,
	type AtprotoOAuthTokenResponse,
	type OAuthClientMetadata,
	type OAuthParResponse,
} from '@atcute/oauth-types';
import type { Keyset } from '@atcute/oauth-keyset';
import { parseResponseAsJson, pipe, validateJsonWith } from '@atcute/util-fetch';

import { JSON_MIME, PAR_RESPONSE_MAX_SIZE, TOKEN_RESPONSE_MAX_SIZE } from './constants.js';
import { createDpopFetch } from './dpop/fetch-dpop.js';
import { OAuthResponseError, TokenRefreshError } from './errors.js';
import {
	createClientAssertionFactory,
	type ClientAuthMethod,
	type ClientCredentialsFactory,
} from './oauth-client-auth.js';
import { OAuthResolver } from './resolvers/index.js';
import type { TokenSet } from './types/token-set.js';
import type { Store } from './utils/store.js';

const processTokenResponse = pipe(
	parseResponseAsJson(JSON_MIME, TOKEN_RESPONSE_MAX_SIZE),
	validateJsonWith(atprotoOAuthTokenResponseSchema, { mode: 'passthrough' }),
);

const processParResponse = pipe(
	parseResponseAsJson(JSON_MIME, PAR_RESPONSE_MAX_SIZE),
	validateJsonWith(oauthParResponseSchema, { mode: 'passthrough' }),
);

export type DpopNonceCache = Store<string, string>;

export interface OAuthServerAgentOptions {
	/** negotiated client authentication method */
	authMethod: ClientAuthMethod;
	/** DPoP private key */
	dpopKey: JWK;
	/** authorization server metadata */
	serverMetadata: AtprotoAuthorizationServerMetadata;
	/** client metadata */
	clientMetadata: OAuthClientMetadata;
	/** DPoP nonce cache, keyed by origin */
	dpopNonces: DpopNonceCache;
	/** OAuth resolver for identity verification */
	oauthResolver: OAuthResolver;
	/** client's private keyset */
	keyset: Keyset;
	/** custom fetch implementation */
	fetch?: typeof globalThis.fetch;
}

/**
 * handles OAuth operations with an authorization server.
 *
 * manages token exchange, refresh, and revocation with DPoP support.
 */
export class OAuthServerAgent {
	readonly authMethod: ClientAuthMethod;
	readonly dpopKey: JWK;
	readonly serverMetadata: AtprotoAuthorizationServerMetadata;
	readonly clientMetadata: OAuthClientMetadata;
	readonly oauthResolver: OAuthResolver;
	readonly keyset: Keyset;
	readonly dpopNonces: DpopNonceCache;

	private readonly dpopFetch: typeof globalThis.fetch;
	private readonly clientCredentialsFactory: ClientCredentialsFactory;

	constructor(options: OAuthServerAgentOptions) {
		this.authMethod = options.authMethod;
		this.dpopKey = options.dpopKey;
		this.serverMetadata = options.serverMetadata;
		this.clientMetadata = options.clientMetadata;
		this.oauthResolver = options.oauthResolver;
		this.keyset = options.keyset;
		this.dpopNonces = options.dpopNonces;

		this.clientCredentialsFactory = createClientAssertionFactory({
			authMethod: options.authMethod,
			serverMetadata: options.serverMetadata,
			clientId: options.clientMetadata.client_id!,
			keyset: options.keyset,
		});

		this.dpopFetch = createDpopFetch({
			key: options.dpopKey,
			nonces: options.dpopNonces,
			supportedAlgs: options.serverMetadata.dpop_signing_alg_values_supported,
			isAuthServer: true,
			fetch: options.fetch,
		});
	}

	get issuer(): string {
		return this.serverMetadata.issuer;
	}

	/**
	 * revokes a token (access or refresh).
	 *
	 * @param token token to revoke
	 */
	async revoke(token: string): Promise<void> {
		const endpoint = this.serverMetadata.revocation_endpoint;
		if (!endpoint) {
			return;
		}

		try {
			await this.request(endpoint, { token });
		} catch {
			// ignore revocation errors
		}
	}

	/**
	 * exchanges an authorization code for tokens.
	 *
	 * @param code authorization code from callback
	 * @param codeVerifier PKCE code verifier
	 * @param redirectUri redirect URI used in authorization request
	 * @returns token set with verified subject
	 */
	async exchangeCode(code: string, codeVerifier: string, redirectUri: string): Promise<TokenSet> {
		const now = Date.now();

		const tokenResponse = await this.requestToken({
			grant_type: 'authorization_code',
			redirect_uri: redirectUri,
			code,
			code_verifier: codeVerifier,
		});

		try {
			// IMPORTANT: verify that the subject's issuer matches this server
			const aud = await this.verifyIssuer(tokenResponse.sub);

			return {
				iss: this.issuer,
				sub: tokenResponse.sub,
				aud,
				scope: tokenResponse.scope,
				access_token: tokenResponse.access_token,
				refresh_token: tokenResponse.refresh_token,
				token_type: tokenResponse.token_type,
				expires_at:
					typeof tokenResponse.expires_in === 'number' ? now + tokenResponse.expires_in * 1000 : undefined,
			};
		} catch (err) {
			// revoke on verification failure
			await this.revoke(tokenResponse.access_token);
			throw err;
		}
	}

	/**
	 * refreshes an existing token set.
	 *
	 * @param tokenSet current token set
	 * @returns new token set
	 * @throws {TokenRefreshError} if no refresh token or refresh fails
	 */
	async refresh(tokenSet: TokenSet): Promise<TokenSet> {
		if (!tokenSet.refresh_token) {
			throw new TokenRefreshError(tokenSet.sub, 'no refresh token available');
		}

		// verify issuer BEFORE refresh to avoid unnecessary requests
		const aud = await this.verifyIssuer(tokenSet.sub);

		const now = Date.now();

		const tokenResponse = await this.requestToken({
			grant_type: 'refresh_token',
			refresh_token: tokenSet.refresh_token,
		});

		return {
			iss: this.issuer,
			sub: tokenSet.sub,
			aud,
			scope: tokenResponse.scope,
			access_token: tokenResponse.access_token,
			refresh_token: tokenResponse.refresh_token,
			token_type: tokenResponse.token_type,
			expires_at:
				typeof tokenResponse.expires_in === 'number' ? now + tokenResponse.expires_in * 1000 : undefined,
		};
	}

	/**
	 * sends a pushed authorization request (PAR).
	 *
	 * @param params authorization request parameters
	 * @returns PAR response with request_uri
	 */
	async pushAuthorizationRequest(params: Record<string, string>): Promise<OAuthParResponse> {
		const endpoint = this.serverMetadata.pushed_authorization_request_endpoint;
		const { json } = await this.request(endpoint, params, processParResponse);
		return json;
	}

	/**
	 * verifies that the subject's authorization server matches this one.
	 *
	 * this is a critical security check per atproto OAuth spec.
	 *
	 * @param sub user's DID
	 * @returns user's PDS URL
	 * @throws if issuer doesn't match
	 */
	private async verifyIssuer(sub: Did): Promise<string> {
		const resolved = await this.oauthResolver.resolveFromIdentity(sub, {
			noCache: true,
			signal: AbortSignal.timeout(10_000),
		});

		if (this.issuer !== resolved.metadata.issuer) {
			throw new TypeError(
				`issuer mismatch: token issued by ${this.issuer}, but identity resolves to ${resolved.metadata.issuer}`,
			);
		}

		return resolved.identity.pds;
	}

	/**
	 * makes a token endpoint request.
	 */
	private async requestToken(params: Record<string, string | undefined>): Promise<AtprotoOAuthTokenResponse> {
		const endpoint = this.serverMetadata.token_endpoint;
		const { json } = await this.request(endpoint, params, processTokenResponse);
		return json;
	}

	/**
	 * makes a request to an authorization server endpoint.
	 */
	private async request<T>(
		endpoint: string,
		params: Record<string, string | undefined>,
		processor?: (response: Response) => Promise<{ response: Response; json: T }>,
	): Promise<{ response: Response; json: T }> {
		const credentials = await this.clientCredentialsFactory();

		const body = new URLSearchParams();
		// add request params
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				body.set(key, value);
			}
		}
		// add client credentials
		body.set('client_id', credentials.client_id);
		body.set('client_assertion_type', credentials.client_assertion_type);
		body.set('client_assertion', credentials.client_assertion);

		const response = await this.dpopFetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: body.toString(),
		});

		if (!response.ok) {
			let error = 'unknown_error';
			let errorDescription: string | undefined;

			try {
				const json = await response.clone().json();
				if (typeof json === 'object' && json !== null) {
					error = json.error ?? error;
					errorDescription = json.error_description;
				}
			} catch {
				// ignore parse errors
			}

			throw new OAuthResponseError(response, error, errorDescription);
		}

		if (processor) {
			return processor(response);
		}

		// for endpoints without specific processing (e.g., revocation)
		return { response, json: undefined as T };
	}
}
