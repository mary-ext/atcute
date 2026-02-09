import type { ComAtprotoServerCreateSession } from '@atcute/atproto';
import { getPdsEndpoint, type DidDocument } from '@atcute/identity';
import type { Did } from '@atcute/lexicons';

import { Client, ClientResponseError, isXRPCErrorPayload, ok } from './client.ts';
import { simpleFetchHandler, type FetchHandlerObject } from './fetch-handler.ts';
import { decodeJwt } from './utils/jwt.ts';

/**
 * represents the decoded access token, for convenience
 * @deprecated
 */
export interface AtpAccessJwt {
	/** access token scope */
	scope:
		| 'com.atproto.access'
		| 'com.atproto.appPass'
		| 'com.atproto.appPassPrivileged'
		| 'com.atproto.signupQueued'
		| 'com.atproto.takendown';
	/** account DID */
	sub: Did;
	/** expiration time in Unix seconds */
	exp: number;
	/** token issued time in Unix seconds */
	iat: number;
}

/**
 * represents the the decoded refresh token, for convenience
 * @deprecated
 */
export interface AtpRefreshJwt {
	/** refresh token scope */
	scope: 'com.atproto.refresh';
	/** unique identifier for this session */
	jti: string;
	/** account DID */
	sub: Did;
	/** intended audience of this refresh token, in DID */
	aud: Did;
	/** token expiration time in seconds */
	exp: number;
	/** token issued time in seconds */
	iat: number;
}

/** session data, can be persisted and reused */
export interface AtpSessionData {
	/** refresh token */
	refreshJwt: string;
	/** access token */
	accessJwt: string;
	/** account handle */
	handle: string;
	/** account DID */
	did: Did;
	/** PDS endpoint found in the DID document, this will be used as the service URI if provided */
	pdsUri?: string;
	/** email address of the account, might not be available if on app password */
	email?: string;
	/** whether the email address has been confirmed or not */
	emailConfirmed?: boolean;
	/** whether the account has email-based two-factor authentication enabled */
	emailAuthFactor?: boolean;
	/** whether the account is active (not deactivated, taken down, or suspended) */
	active: boolean;
	/** possible reason for why the account is inactive */
	inactiveStatus?: string;
}

export interface CredentialManagerOptions {
	/** PDS server URL */
	service: string;

	/** custom fetch function */
	fetch?: typeof fetch;

	/** function called when the session expires and can't be refreshed */
	onExpired?: (session: AtpSessionData) => void;
	/** function called after a successful session refresh */
	onRefresh?: (session: AtpSessionData) => void;
	/** function called whenever the session object is updated (login, resume, refresh) */
	onSessionUpdate?: (session: AtpSessionData) => void;
}

export class CredentialManager implements FetchHandlerObject {
	/** service URL to make authentication requests with */
	readonly serviceUrl: string;
	/** fetch implementation */
	fetch: typeof fetch;

	/** internal client instance for making authentication requests */
	#server: Client;
	/** holds a promise for the current refresh operation, used for debouncing */
	#refreshSessionPromise: Promise<void> | undefined;

	/** callback for session expiration */
	#onExpired: CredentialManagerOptions['onExpired'];
	/** callback for successful session refresh */
	#onRefresh: CredentialManagerOptions['onRefresh'];
	/** callback for session updates */
	#onSessionUpdate: CredentialManagerOptions['onSessionUpdate'];

	/** current active session, undefined if not authenticated */
	session?: AtpSessionData;

	constructor({
		service,
		onExpired,
		onRefresh,
		onSessionUpdate,
		fetch: _fetch = fetch,
	}: CredentialManagerOptions) {
		this.serviceUrl = service;
		this.fetch = _fetch;

		this.#server = new Client({ handler: simpleFetchHandler({ service, fetch: _fetch }) });

		this.#onRefresh = onRefresh;
		this.#onExpired = onExpired;
		this.#onSessionUpdate = onSessionUpdate;
	}

	/** service URL to make actual API requests with */
	get dispatchUrl() {
		return this.session?.pdsUri ?? this.serviceUrl;
	}

	async handle(pathname: string, init: RequestInit): Promise<Response> {
		await this.#refreshSessionPromise;

		const url = new URL(pathname, this.dispatchUrl);
		const headers = new Headers(init.headers);

		if (!this.session || headers.has('authorization')) {
			return (0, this.fetch)(url, init);
		}

		const initialToken = this.session.accessJwt;
		headers.set('authorization', `Bearer ${initialToken}`);

		const initialResponse = await (0, this.fetch)(url, { ...init, headers });

		if (initialResponse.status !== 401 && !(await isExpiredTokenResponse(initialResponse))) {
			return initialResponse;
		}

		try {
			await this.#refreshSession();
		} catch {
			return initialResponse;
		}

		// return initial response if:
		// - request was aborted
		// - refresh failed and cleared the session
		// - token didn't actually change (refresh failed silently)
		// - request body was a stream (can't be resent)
		const updatedToken = this.session?.accessJwt;
		if (
			init.signal?.aborted ||
			!updatedToken ||
			updatedToken === initialToken ||
			init.body instanceof ReadableStream
		) {
			return initialResponse;
		}

		// cancel initial response to avoid resource leaks (Node.js)
		await initialResponse.body?.cancel();

		headers.set('authorization', `Bearer ${updatedToken}`);
		return await (0, this.fetch)(url, { ...init, headers });
	}

	#refreshSession() {
		return (this.#refreshSessionPromise ||= this.#refreshSessionInner().finally(
			() => (this.#refreshSessionPromise = undefined),
		));
	}

	async #refreshSessionInner(): Promise<void> {
		const currentSession = this.session;
		if (!currentSession) {
			return;
		}

		const response = await this.#server.post('com.atproto.server.refreshSession', {
			headers: {
				authorization: `Bearer ${currentSession.refreshJwt}`,
			},
		});

		if (!response.ok) {
			const isExpired =
				response.status === 401 ||
				response.data.error === 'ExpiredToken' ||
				response.data.error === 'InvalidToken';

			if (isExpired) {
				this.session = undefined;
				this.#onExpired?.(currentSession);
			}

			throw new ClientResponseError(response);
		}

		// DID must not change during refresh
		if (response.data.did !== currentSession.did) {
			this.session = undefined;
			this.#onExpired?.(currentSession);
			throw new ClientResponseError({ status: 401, data: { error: 'InvalidDID' } });
		}

		// protect against concurrent session updates
		if (this.session !== currentSession) {
			throw new Error('concurrent session update detected');
		}

		this.#updateSession({ ...currentSession, ...response.data });
		this.#onRefresh?.(this.session!);
	}

	#updateSession(raw: ComAtprotoServerCreateSession.$output): AtpSessionData {
		const didDoc = raw.didDoc as DidDocument | undefined;

		let pdsUri: string | undefined;
		if (didDoc) {
			pdsUri = getPdsEndpoint(didDoc);
		}

		const newSession: AtpSessionData = {
			accessJwt: raw.accessJwt,
			refreshJwt: raw.refreshJwt,
			handle: raw.handle,
			did: raw.did,
			pdsUri: pdsUri,
			email: raw.email,
			emailConfirmed: raw.emailConfirmed,
			emailAuthFactor: raw.emailAuthFactor,
			active: raw.active ?? true,
			inactiveStatus: raw.status,
		};

		this.session = newSession;
		this.#onSessionUpdate?.(newSession);

		return newSession;
	}

	/**
	 * resume from a persisted session
	 * @param session session data, taken from `AtpAuth#session` after login
	 */
	async resume(session: AtpSessionData): Promise<AtpSessionData> {
		// protect against concurrent resume of the same session
		if (session.refreshJwt === this.session?.refreshJwt) {
			await this.#refreshSessionPromise;
			if (!this.session || session.did !== this.session.did) {
				throw new ClientResponseError({ status: 401, data: { error: 'InvalidToken' } });
			}
			return this.session;
		}

		const now = Date.now() / 1_000 + 60 * 5;

		const refreshToken = decodeJwt(session.refreshJwt) as AtpRefreshJwt;
		if (now >= refreshToken.exp || refreshToken.sub !== session.did) {
			throw new ClientResponseError({ status: 401, data: { error: 'InvalidToken' } });
		}

		const accessToken = decodeJwt(session.accessJwt) as AtpAccessJwt;
		if (accessToken.sub !== session.did) {
			throw new ClientResponseError({ status: 401, data: { error: 'InvalidToken' } });
		}

		// set the session and clear any stale refresh promise
		this.session = session;
		this.#refreshSessionPromise = undefined;

		if (now >= accessToken.exp) {
			// access token expired, need to refresh
			await this.#refreshSession();
		} else {
			// access token still valid, fetch session info in background
			const promise = ok(
				this.#server.get('com.atproto.server.getSession', {
					headers: {
						authorization: `Bearer ${session.accessJwt}`,
					},
				}),
			);

			promise.then(
				(next) => {
					const existing = this.session;
					if (!existing || existing.did !== next.did) {
						return;
					}

					this.#updateSession({ ...existing, ...next });
				},
				(_err) => {
					// ignore error
				},
			);
		}

		if (!this.session) {
			throw new ClientResponseError({ status: 401, data: { error: 'InvalidToken' } });
		}

		return this.session;
	}

	/**
	 * sign in to an account
	 * @param options credential options
	 * @returns session data
	 */
	async login(options: AuthLoginOptions): Promise<AtpSessionData> {
		// reset the session
		this.session = undefined;
		this.#refreshSessionPromise = undefined;

		const session = await ok(
			this.#server.post('com.atproto.server.createSession', {
				input: {
					identifier: options.identifier,
					password: options.password,
					authFactorToken: options.code,
					allowTakendown: options.allowTakendown,
				},
			}),
		);

		return this.#updateSession(session);
	}

	/**
	 * sign out of the current session, invalidating it server-side
	 */
	async logout(): Promise<void> {
		const currentSession = this.session;
		if (!currentSession) {
			return;
		}

		this.session = undefined;
		this.#refreshSessionPromise = undefined;

		try {
			await this.#server.post('com.atproto.server.deleteSession', {
				as: null,
				headers: {
					authorization: `Bearer ${currentSession.refreshJwt}`,
				},
			});
		} catch {
			// ignore errors - session is already cleared locally
		}
	}
}

/** credentials */
export interface AuthLoginOptions {
	/** what account to login as, this could be domain handle, DID, or email address */
	identifier: string;
	/** account password */
	password: string;
	/** two-factor authentication code, if email TOTP is enabled */
	code?: string;
	/** allow signing in even if the account has been taken down */
	allowTakendown?: boolean;
}

const isExpiredTokenResponse = async (response: Response): Promise<boolean> => {
	if (response.status !== 400) {
		return false;
	}

	if (extractContentType(response.headers) !== 'application/json') {
		return false;
	}

	// this is nasty as it relies heavily on what the PDS returns, but avoiding
	// cloning and reading the request as much as possible is better.

	// {"error":"ExpiredToken","message":"Token has expired"}
	// {"error":"ExpiredToken","message":"Token is expired"}
	if (extractContentLength(response.headers) > 54 * 1.5) {
		return false;
	}

	try {
		const data = await response.clone().json();
		if (isXRPCErrorPayload(data)) {
			return data.error === 'ExpiredToken';
		}
	} catch {}

	return false;
};

const extractContentType = (headers: Headers) => {
	return headers.get('content-type')?.split(';')[0]?.trim();
};
const extractContentLength = (headers: Headers) => {
	return Number(headers.get('content-length') ?? ';');
};
