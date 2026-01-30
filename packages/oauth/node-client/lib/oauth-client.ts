import type { ActorResolver } from '@atcute/identity-resolver';
import type { ActorIdentifier, Did } from '@atcute/lexicons';
import type { ClientAssertionPrivateJwk, DpopNonceCache } from '@atcute/oauth-crypto';
import { generateDpopKey, generatePkce, type PublicJwk } from '@atcute/oauth-crypto';
import { Keyset } from '@atcute/oauth-keyset';
import {
	buildClientMetadata,
	buildPublicClientMetadata,
	FALLBACK_ALG,
	type ConfidentialClientMetadata,
	type OAuthClientMetadata,
	type OAuthPrompt,
	type OAuthResponseMode,
	type PublicClientMetadata,
} from '@atcute/oauth-types';

import { nanoid } from 'nanoid';

import { OAuthCallbackError, TokenRevokedError } from './errors.js';
import { OAuthServerAgent } from './oauth-server-agent.js';
import { OAuthServerFactory } from './oauth-server-factory.js';
import { OAuthSession } from './oauth-session.js';
import {
	AuthorizationServerMetadataResolver,
	type AuthorizationServerMetadataCache,
} from './resolvers/authorization-server-metadata.js';
import { OAuthResolver } from './resolvers/index.js';
import {
	ProtectedResourceMetadataResolver,
	type ProtectedResourceMetadataCache,
} from './resolvers/protected-resource-metadata.js';
import { SessionGetter, type SessionEventListener } from './session-getter.js';
import type { SessionStore } from './types/sessions.js';
import type { StateStore, StoredState } from './types/states.js';
import type { LockFunction } from './utils/lock.js';
import { MemoryStore } from './utils/memory-store.js';

export interface OAuthClientStores {
	/** session store, keyed by DID */
	sessions: SessionStore;
	/** authorization state store, keyed by state ID (short-lived) */
	states: StateStore;
	/** DPoP nonce cache, keyed by origin (defaults to in-memory) */
	dpopNonces?: DpopNonceCache;
	/** AS metadata cache, keyed by issuer (defaults to in-memory) */
	asMetadata?: AuthorizationServerMetadataCache;
	/** protected resource metadata cache, keyed by origin (defaults to in-memory) */
	prMetadata?: ProtectedResourceMetadataCache;
}

/** options for a confidential OAuth client (with keyset for private_key_jwt) */
export interface ConfidentialOAuthClientOptions {
	/** client metadata */
	metadata: ConfidentialClientMetadata;
	/** client's signing keys (or an already constructed keyset) */
	keyset: Keyset | ClientAssertionPrivateJwk[];
	/** identity resolver for DID/handle resolution */
	actorResolver: ActorResolver;
	/** storage backends */
	stores: OAuthClientStores;

	/** OAuth response mode for authorization responses */
	responseMode?: OAuthResponseMode;
	/** lock function for coordinating token refresh, defaults to in-memory */
	requestLock?: LockFunction;

	/** custom fetch implementation */
	fetch?: typeof globalThis.fetch;
}

/** options for a public OAuth client (no keyset, uses token_endpoint_auth_method: 'none') */
export interface PublicOAuthClientOptions {
	/** public client metadata */
	metadata: PublicClientMetadata;
	/** identity resolver for DID/handle resolution */
	actorResolver: ActorResolver;
	/** storage backends */
	stores: OAuthClientStores;

	/** OAuth response mode for authorization responses */
	responseMode?: OAuthResponseMode;
	/** lock function for coordinating token refresh, defaults to in-memory */
	requestLock?: LockFunction;

	/** custom fetch implementation */
	fetch?: typeof globalThis.fetch;
}

/**
 * options for creating an OAuth client.
 *
 * - confidential clients provide a `keyset` for private_key_jwt authentication
 * - public clients omit `keyset` and use token_endpoint_auth_method: 'none'
 */
export type OAuthClientOptions = ConfidentialOAuthClientOptions | PublicOAuthClientOptions;

export type AuthorizeTarget =
	| { type: 'account'; identifier: ActorIdentifier }
	| { type: 'pds'; serviceUrl: string };

type OAuthPromptInput = OAuthPrompt | (string & {});

export interface AuthorizeOptions {
	/** target account (handle or DID) or PDS URL */
	target: AuthorizeTarget;
	/** requested scopes (defaults to client metadata scope) */
	scope?: string;
	/** which redirect_uri to use (defaults to first in metadata.redirect_uris) */
	redirectUri?: string;
	/** user-provided state to preserve through flow */
	state?: unknown;
	/** oidc prompt parameter (string or fallback list) */
	prompt?: OAuthPromptInput | readonly OAuthPromptInput[];
	/** abort signal */
	signal?: AbortSignal;
}

export interface AuthorizationResult {
	/** URL to redirect user to */
	url: URL;
	/** state ID (the OAuth `state` parameter) */
	stateId: string;
}

export interface CallbackOptions {
	/** override redirect_uri for token exchange */
	redirectUri?: string;
}

export interface CallbackResult {
	/** authenticated session */
	session: OAuthSession;
	/** user-provided state from authorize() */
	state: unknown;
}

export interface RestoreOptions {
	/**
	 * 'auto' (default): refresh if token is stale
	 * true: force refresh even if not stale
	 * false: don't refresh, return session even if stale
	 */
	refresh?: boolean | 'auto';
}

/**
 * OAuth client for AT Protocol.
 *
 * supports both confidential clients (with keyset for private_key_jwt) and
 * public clients (no keyset, uses token_endpoint_auth_method: 'none').
 *
 * handles authorization flow, session management, and token lifecycle.
 */
export class OAuthClient {
	readonly metadata: OAuthClientMetadata;
	readonly keyset: Keyset | undefined;

	private readonly responseMode: OAuthResponseMode;
	private readonly resolver: OAuthResolver;
	private readonly serverFactory: OAuthServerFactory;
	private readonly sessionGetter: SessionGetter;
	private readonly stateStore: StateStore;
	private readonly fetch: typeof globalThis.fetch;

	constructor(options: OAuthClientOptions) {
		const { stores } = options;

		let metadata: OAuthClientMetadata;
		let keyset: Keyset | undefined;

		if ('keyset' in options && options.keyset !== undefined) {
			// confidential client
			keyset = Array.isArray(options.keyset) ? new Keyset(options.keyset) : options.keyset;
			metadata = buildClientMetadata(options.metadata as ConfidentialClientMetadata, keyset);
		} else {
			// public client
			keyset = undefined;
			metadata = buildPublicClientMetadata(options.metadata as PublicClientMetadata);
		}

		this.metadata = metadata;
		this.keyset = keyset;
		this.responseMode = options.responseMode ?? 'query';
		this.fetch = options.fetch ?? globalThis.fetch;

		const protectedResourceMetadataCache =
			stores.prMetadata ??
			new MemoryStore({
				maxSize: 100,
				ttl: 60e3,
				ttlAutopurge: true,
			});

		const authorizationServerMetadataCache =
			stores.asMetadata ??
			new MemoryStore({
				maxSize: 100,
				ttl: 60e3,
				ttlAutopurge: true,
			});

		const dpopNoncesCache =
			stores.dpopNonces ??
			new MemoryStore({
				maxSize: 100,
				ttl: 60e3,
				ttlAutopurge: true,
			});

		this.resolver = new OAuthResolver(
			options.actorResolver,
			new ProtectedResourceMetadataResolver({
				cache: protectedResourceMetadataCache,
				fetch: this.fetch,
			}),
			new AuthorizationServerMetadataResolver({
				cache: authorizationServerMetadataCache,
				fetch: this.fetch,
			}),
		);

		this.serverFactory = new OAuthServerFactory({
			clientMetadata: this.metadata,
			resolver: this.resolver,
			keyset: keyset,
			dpopNonces: dpopNoncesCache,
			fetch: this.fetch,
		});

		this.sessionGetter = new SessionGetter({
			sessionStore: stores.sessions,
			serverFactory: this.serverFactory,
			requestLock: options.requestLock,
		});

		this.stateStore = stores.states;
	}

	/**
	 * public JWKS for serving at jwks_uri.
	 *
	 * returns `undefined` for public clients (no keyset).
	 */
	get jwks(): { keys: readonly PublicJwk[] } | undefined {
		return this.keyset?.publicJwks;
	}

	/**
	 * adds a listener for session events (updated, deleted).
	 */
	addEventListener(listener: SessionEventListener): void {
		this.sessionGetter.addEventListener(listener);
	}

	/**
	 * removes a session event listener.
	 */
	removeEventListener(listener: SessionEventListener): void {
		this.sessionGetter.removeEventListener(listener);
	}

	/**
	 * starts the authorization flow.
	 *
	 * @param options authorization options
	 * @returns URL to redirect user to and state ID
	 */
	async authorize(options: AuthorizeOptions): Promise<AuthorizationResult> {
		let { target, scope, state: userState, redirectUri, prompt, signal } = options;

		if (scope !== undefined) {
			scope = validateRequestedScope(scope, this.metadata.scope!);
		} else {
			scope = this.metadata.scope!;
		}

		if (redirectUri !== undefined) {
			if (!this.metadata.redirect_uris.includes(redirectUri)) {
				throw new TypeError(`specified redirect_uri not in client metadata: ${redirectUri}`);
			}
		} else {
			redirectUri = this.metadata.redirect_uris[0];
		}

		// resolve target to AS metadata
		let resolved;
		if (target.type === 'account') {
			resolved = await this.resolver.resolveFromIdentity(target.identifier, {
				signal,
			});
		} else {
			resolved = await this.resolver.resolveFromService(target.serviceUrl, {
				signal,
			});
		}

		const { identity, metadata } = resolved;

		signal?.throwIfAborted();

		const resolvedPrompt = resolvePrompt(prompt, metadata.prompt_values_supported);

		// generate PKCE and DPoP key
		const pkce = await generatePkce();
		const dpopKey = await generateDpopKey(metadata.dpop_signing_alg_values_supported ?? [FALLBACK_ALG]);

		// create server agent and negotiate auth method
		const server = this.serverFactory.fromMetadataNewSession(metadata, dpopKey);

		// generate state
		const stateId = nanoid(24);

		// store authorization state
		const storedState: StoredState = {
			dpopKey,
			authMethod: server.authMethod,
			pkceVerifier: pkce.verifier,
			issuer: metadata.issuer,
			redirectUri,
			sub: identity?.did,
			userState,
			expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
		};

		await this.stateStore.set(stateId, storedState);

		// build PAR request
		const parParams: Record<string, string> = {
			client_id: this.metadata.client_id!,
			redirect_uri: redirectUri,
			response_type: 'code',
			response_mode: this.responseMode,
			scope: scope,
			state: stateId,
			code_challenge: pkce.challenge,
			code_challenge_method: pkce.method,
		};

		// use handle for login_hint, fall back to DID if handle is invalid
		if (identity) {
			parParams.login_hint = identity.handle !== 'handle.invalid' ? identity.handle : identity.did;
		}
		if (resolvedPrompt) {
			parParams.prompt = resolvedPrompt;
		}

		// push authorization request
		const parResponse = await server.pushAuthorizationRequest(parParams);

		// build authorization URL
		const authUrl = new URL(metadata.authorization_endpoint);
		authUrl.searchParams.set('client_id', this.metadata.client_id!);
		authUrl.searchParams.set('request_uri', parResponse.request_uri);

		return { url: authUrl, stateId };
	}

	/**
	 * handles the OAuth callback.
	 *
	 * @param params URL search params from callback
	 * @param options callback options
	 * @returns session and user state
	 */
	async callback(params: URLSearchParams, options?: CallbackOptions): Promise<CallbackResult> {
		const stateParam = params.get('state');
		const errorParam = params.get('error');
		const codeParam = params.get('code');
		const issParam = params.get('iss');

		// validate state
		if (!stateParam) {
			throw new OAuthCallbackError('invalid_request', 'missing state parameter');
		}

		const storedState = await this.stateStore.get(stateParam);
		if (!storedState) {
			throw new OAuthCallbackError('invalid_request', 'unknown state', stateParam);
		}

		// delete state immediately to prevent replay
		await this.stateStore.delete(stateParam);

		// check for error response
		if (errorParam) {
			throw new OAuthCallbackError(errorParam, params.get('error_description') ?? undefined, stateParam);
		}

		// validate code
		if (!codeParam) {
			throw new OAuthCallbackError('invalid_request', 'missing code parameter', stateParam);
		}

		// create server agent from stored state
		const server = await this.serverFactory.fromIssuer(
			storedState.issuer,
			storedState.authMethod,
			storedState.dpopKey,
		);

		// validate iss parameter (RFC 9207 - mix-up attack prevention)
		if (issParam != null) {
			if (server.issuer !== issParam) {
				throw new OAuthCallbackError('invalid_request', 'issuer mismatch', stateParam);
			}
		} else if (server.serverMetadata.authorization_response_iss_parameter_supported) {
			throw new OAuthCallbackError('invalid_request', 'missing iss parameter', stateParam);
		}

		// exchange code for tokens
		const redirectUri = options?.redirectUri ?? storedState.redirectUri;
		const tokenSet = await server.exchangeCode(codeParam, storedState.pkceVerifier, redirectUri);

		// verify expected sub if we resolved one
		if (storedState.sub && tokenSet.sub !== storedState.sub) {
			await server.revoke(tokenSet.access_token);
			throw new OAuthCallbackError('invalid_request', 'sub mismatch', stateParam);
		}

		// store session
		try {
			await this.sessionGetter.setStored(tokenSet.sub, {
				dpopKey: storedState.dpopKey,
				authMethod: server.authMethod,
				tokenSet,
			});
		} catch (err) {
			await server.revoke(tokenSet.access_token);
			throw err;
		}

		const session = this.createSession(server, tokenSet.sub);

		return { session, state: storedState.userState };
	}

	/**
	 * restores an existing session.
	 *
	 * @param sub user's DID
	 * @param options restore options
	 * @returns authenticated session
	 */
	async restore(sub: Did, options?: RestoreOptions): Promise<OAuthSession> {
		const refresh = options?.refresh ?? 'auto';

		const { dpopKey, authMethod, tokenSet } = await this.sessionGetter.getSession(sub, refresh);

		const server = await this.serverFactory.fromIssuer(tokenSet.iss, authMethod, dpopKey, {
			noCache: refresh === true,
		});

		return this.createSession(server, sub);
	}

	/**
	 * revokes and deletes a session.
	 *
	 * @param sub user's DID
	 */
	async revoke(sub: Did): Promise<void> {
		const { dpopKey, authMethod, tokenSet } = await this.sessionGetter.getSession(sub, false);

		try {
			const server = await this.serverFactory.fromIssuer(tokenSet.iss, authMethod, dpopKey);
			await server.revoke(tokenSet.access_token);
		} finally {
			await this.sessionGetter.deleteStored(sub, new TokenRevokedError(sub));
		}
	}

	private createSession(server: OAuthServerAgent, sub: Did): OAuthSession {
		return new OAuthSession(server, sub, this.sessionGetter, this.fetch);
	}
}

const resolvePrompt = (
	prompt: OAuthPromptInput | readonly OAuthPromptInput[] | undefined,
	supported?: readonly OAuthPrompt[],
): OAuthPromptInput | undefined => {
	if (!prompt) {
		return;
	}

	const candidates = Array.isArray(prompt) ? prompt : [prompt];
	if (candidates.length === 0) {
		return;
	}

	if (!supported) {
		return candidates[0];
	}

	for (let i = 0, il = candidates.length; i < il; i++) {
		const candidate = candidates[i];
		if (supported.includes(candidate as OAuthPrompt)) {
			return candidate;
		}
	}

	throw new TypeError(
		`prompt not supported by server (provided: ${candidates.join(', ')}, supported: ${supported.join(', ')})`,
	);
};

const parseScope = (scope: string): string[] => {
	return scope.trim().split(/\s+/);
};

const validateRequestedScope = (requested: string, allowed: string): string => {
	const requestedParts = parseScope(requested);
	if (requestedParts.length === 0) {
		throw new TypeError(`missing scope`);
	}

	for (let i = 0, il = requestedParts.length; i < il; i++) {
		const aka = requestedParts[i];

		for (let j = 0; j < i; j++) {
			if (aka === requestedParts[j]) {
				throw new TypeError(`duplicate "${aka}" scope`);
			}
		}
	}

	const allowedParts = parseScope(allowed);
	for (let i = 0, il = requestedParts.length; i < il; i++) {
		const scope = requestedParts[i];

		let found = false;
		for (let j = 0, jl = allowedParts.length; j < jl; j++) {
			if (scope === allowedParts[j]) {
				found = true;
				break;
			}
		}

		if (!found) {
			throw new Error(`requested "${scope}" scope is not within client metadata's scope`);
		}
	}

	return requestedParts.join(' ');
};
