import type { ComAtprotoServerCreateSession } from '@atcute/atproto';
import {
	Client,
	ClientResponseError,
	isXRPCErrorPayload,
	ok,
	simpleFetchHandler,
	type FetchHandlerObject,
} from '@atcute/client';
import { getPdsEndpoint, type DidDocument } from '@atcute/identity';
import type { Did } from '@atcute/lexicons';

// #region session data

/** persistable session data */
export interface PasswordSessionData {
	/** authentication service URL */
	service: string;
	accessJwt: string;
	refreshJwt: string;
	handle: string;
	did: Did;
	/** PDS endpoint derived from DID document */
	pdsUri?: string;
	email?: string;
	emailConfirmed?: boolean;
	emailAuthFactor?: boolean;
	active: boolean;
	inactiveStatus?: string;
}

// #endregion

// #region options

export interface PasswordSessionOptions {
	/** custom fetch implementation */
	fetch?: typeof fetch;

	/**
	 * called when session is successfully created or refreshed with new
	 * credentials. use this to persist the updated session.
	 * receives `this: PasswordSession` context.
	 * @note must not throw
	 */
	onUpdate?: (this: PasswordSession, data: PasswordSessionData) => void | Promise<void>;

	/**
	 * called when a session refresh fails due to a transient error (network,
	 * server down). the session is preserved — consider retry logic.
	 * @note must not throw
	 */
	onUpdateFailure?: (
		this: PasswordSession,
		data: PasswordSessionData,
		error: unknown,
	) => void | Promise<void>;

	/**
	 * called when the session is terminated — either explicit logout or
	 * server-side invalidation (expired/invalid refresh token).
	 * use this to clean up persisted session data.
	 * @note must not throw
	 */
	onDelete?: (this: PasswordSession, data: PasswordSessionData) => void | Promise<void>;

	/**
	 * called when logout network request fails due to a transient error.
	 * the session stays active locally so you can retry.
	 * @note must not throw
	 */
	onDeleteFailure?: (
		this: PasswordSession,
		data: PasswordSessionData,
		error: unknown,
	) => void | Promise<void>;
}

/** credentials for login */
export interface PasswordSessionLoginCredentials {
	service: string;
	identifier: string;
	password: string;
	/** two-factor authentication code */
	code?: string;
	/** allow signing in even if the account has been taken down */
	allowTakendown?: boolean;
}

/** options for login — second parameter, behavior config */
export interface PasswordSessionLoginOptions extends PasswordSessionOptions {
	/** cached session to try resuming before falling back to fresh login */
	session?: PasswordSessionData;
}

// #endregion

// #region class

/**
 * password-based authentication session for AT Protocol services.
 *
 * manages access/refresh token lifecycle, automatic refresh on 401, and
 * session persistence via callbacks. instances are always in an authenticated
 * state — use the static factories for validated construction.
 *
 * for browser-based applications, prefer OAuth-based authentication instead.
 * when using password auth, use app passwords rather than main account credentials.
 */
export class PasswordSession implements FetchHandlerObject, AsyncDisposable {
	#sessionData: PasswordSessionData | null;
	#sessionPromise: Promise<PasswordSessionData>;
	#server: Client;
	#fetch: typeof fetch;

	#onUpdate: PasswordSessionOptions['onUpdate'];
	#onUpdateFailure: PasswordSessionOptions['onUpdateFailure'];
	#onDelete: PasswordSessionOptions['onDelete'];
	#onDeleteFailure: PasswordSessionOptions['onDeleteFailure'];

	/**
	 * construct with existing session data. tokens refresh lazily on 401.
	 * use static `login()` or `resume()` for validated sessions.
	 * @param session existing session data
	 * @param options session options
	 */
	constructor(session: PasswordSessionData, options: PasswordSessionOptions = {}) {
		this.#sessionData = session;
		this.#sessionPromise = Promise.resolve(session);
		this.#fetch = options.fetch ?? fetch;

		this.#server = new Client({
			handler: simpleFetchHandler({ service: session.service, fetch: this.#fetch }),
		});

		this.#onUpdate = options.onUpdate;
		this.#onUpdateFailure = options.onUpdateFailure;
		this.#onDelete = options.onDelete;
		this.#onDeleteFailure = options.onDeleteFailure;
	}

	/**
	 * account DID
	 * @throws if the session has been destroyed
	 */
	get did(): Did {
		return this.session.did;
	}

	/** whether this session has been destroyed (logged out) */
	get destroyed(): boolean {
		return this.#sessionData === null;
	}

	/**
	 * current session data — serialize this for persistence
	 * @throws if the session has been destroyed
	 */
	get session(): PasswordSessionData {
		if (this.#sessionData) {
			return this.#sessionData;
		}
		throw new Error(`session has been destroyed`);
	}

	/** URL to dispatch API requests to (PDS from DID doc, or service URL) */
	get dispatchUrl(): string {
		return this.session.pdsUri ?? this.session.service;
	}

	// --- static factories ---

	/**
	 * authenticate with credentials. optionally tries resuming a cached
	 * session first, falling back to fresh createSession on failure.
	 * @param credentials login credentials or URL shorthand (`https://handle:pass@service`)
	 * @param options login options
	 * @returns authenticated session
	 */
	static async login(
		credentials: PasswordSessionLoginCredentials | string | URL,
		options: PasswordSessionLoginOptions = {},
	): Promise<PasswordSession> {
		const creds =
			typeof credentials === 'string' || credentials instanceof URL
				? parseLoginUrl(credentials)
				: credentials;

		// try cached session first if provided
		if (options.session) {
			try {
				return await PasswordSession.resume(options.session, options);
			} catch {
				// fall through to fresh login
			}
		}

		const _fetch = options.fetch ?? fetch;
		const server = new Client({
			handler: simpleFetchHandler({ service: creds.service, fetch: _fetch }),
		});

		const data = await ok(
			server.post('com.atproto.server.createSession', {
				input: {
					identifier: creds.identifier,
					password: creds.password,
					authFactorToken: creds.code,
					allowTakendown: creds.allowTakendown,
				},
			}),
		);

		const sessionData = buildSessionData(creds.service, data);
		const session = new PasswordSession(sessionData, options);
		await options.onUpdate?.call(session, sessionData);
		return session;
	}

	/**
	 * resume from persisted session data. if the access token is still valid,
	 * returns immediately and refreshes metadata in the background.
	 * if expired, refreshes synchronously. throws only if the session is
	 * definitively invalid.
	 * @param session persisted session data
	 * @param options session options
	 * @returns resumed session
	 */
	static async resume(
		session: PasswordSessionData,
		options: PasswordSessionOptions = {},
	): Promise<PasswordSession> {
		const instance = new PasswordSession(session, options);

		const now = Date.now() / 1_000 + 60 * 5;
		const accessToken = decodeJwt(session.accessJwt) as { exp: number };

		if (now >= accessToken.exp) {
			// access token expired or expiring soon, refresh synchronously
			await instance.refresh();
		} else {
			// access token still valid, fetch session metadata in background
			instance.#refreshMetadata(session);
		}

		if (instance.destroyed) {
			throw new ClientResponseError({ status: 401, data: { error: 'InvalidToken' } });
		}

		return instance;
	}

	/**
	 * delete a session server-side without resuming it.
	 * useful for cleanup of orphaned sessions.
	 * @param session session data to delete
	 * @param options session options
	 */
	static async delete(session: PasswordSessionData, options: PasswordSessionOptions = {}): Promise<void> {
		const instance = new PasswordSession(session, options);
		await instance.logout();
	}

	// --- lifecycle ---

	/** refresh the session tokens */
	async refresh(): Promise<void> {
		await this.#refresh();
	}

	/**
	 * sign out — invalidates session server-side.
	 * on success, the session is destroyed and `onDelete` is called.
	 * on transient failure (network), `onDeleteFailure` is called and
	 * the session stays active for retry.
	 * @throws on transient failure when the session couldn't be deleted
	 */
	async logout(): Promise<void> {
		let failure: unknown = null;

		this.#sessionPromise = this.#sessionPromise.then(async (sessionData) => {
			const response = await this.#server.post('com.atproto.server.deleteSession', {
				as: null,
				headers: {
					authorization: `Bearer ${sessionData.refreshJwt}`,
				},
			});

			if (!response.ok) {
				const isExpected =
					response.status === 401 ||
					response.data.error === 'InvalidToken' ||
					response.data.error === 'ExpiredToken';

				if (!isExpected) {
					// transient error — keep session alive
					failure = new ClientResponseError(response);
					await this.#onDeleteFailure?.(sessionData, failure);
					return sessionData;
				}
			}

			// success or expected error → session is gone
			await this.#onDelete?.(sessionData);
			this.#sessionData = null;
			throw new Error(`session has been destroyed`);
		});

		return this.#sessionPromise.then(
			() => {
				// resolved means logout failed (transient error)
				throw failure!;
			},
			() => {
				// rejected means session was destroyed (successful logout)
			},
		);
	}

	/** AsyncDisposable — calls `logout()` */
	async [Symbol.asyncDispose](): Promise<void> {
		await this.logout();
	}

	// --- FetchHandlerObject ---

	async handle(pathname: string, init: RequestInit): Promise<Response> {
		const sessionPromise = this.#sessionPromise;
		const sessionData = await sessionPromise;

		const url = new URL(pathname, sessionData.pdsUri ?? sessionData.service);
		const headers = new Headers(init.headers);

		if (headers.has('authorization')) {
			return (0, this.#fetch)(url, init);
		}

		headers.set('authorization', `Bearer ${sessionData.accessJwt}`);

		const initialResponse = await (0, this.#fetch)(url, { ...init, headers });

		if (initialResponse.status !== 401 && !(await isExpiredTokenResponse(initialResponse))) {
			return initialResponse;
		}

		// refresh unless another call already started one
		const refreshPromise =
			this.#sessionPromise === sessionPromise ? this.#refresh() : this.#sessionPromise;

		const newSessionData = await refreshPromise.catch(() => null);

		if (
			!newSessionData ||
			newSessionData.accessJwt === sessionData.accessJwt ||
			init.signal?.aborted ||
			init.body instanceof ReadableStream
		) {
			return initialResponse;
		}

		// cancel initial response to avoid resource leaks
		if (!initialResponse.bodyUsed) {
			await initialResponse.body?.cancel();
		}

		headers.set('authorization', `Bearer ${newSessionData.accessJwt}`);
		return await (0, this.#fetch)(url, { ...init, headers });
	}

	// --- internal ---

	#refresh(): Promise<PasswordSessionData> {
		this.#sessionPromise = this.#sessionPromise.then(async (sessionData) => {
			const response = await this.#server.post('com.atproto.server.refreshSession', {
				headers: {
					authorization: `Bearer ${sessionData.refreshJwt}`,
				},
			});

			if (!response.ok) {
				const isExpected =
					response.status === 401 ||
					response.data.error === 'ExpiredToken' ||
					response.data.error === 'InvalidToken';

				if (isExpected) {
					await this.#onDelete?.(sessionData);
					this.#sessionData = null;
					throw new ClientResponseError(response);
				}

				// transient error — preserve session
				await this.#onUpdateFailure?.(sessionData, new ClientResponseError(response));
				return sessionData;
			}

			// DID must not change during refresh
			if (response.data.did !== sessionData.did) {
				await this.#onDelete?.(sessionData);
				this.#sessionData = null;
				throw new ClientResponseError({ status: 401, data: { error: 'InvalidToken' } });
			}

			const newSession = buildSessionData(sessionData.service, { ...sessionData, ...response.data });
			this.#sessionData = newSession;
			await this.#onUpdate?.(newSession);
			return newSession;
		});

		return this.#sessionPromise;
	}

	#refreshMetadata(session: PasswordSessionData): void {
		const promise = ok(
			this.#server.get('com.atproto.server.getSession', {
				headers: {
					authorization: `Bearer ${session.accessJwt}`,
				},
			}),
		);

		promise.then(
			(next) => {
				const existing = this.#sessionData;
				if (!existing || existing.did !== next.did) {
					return;
				}

				const updated = buildSessionData(existing.service, { ...existing, ...next });
				this.#sessionData = updated;
				this.#onUpdate?.(updated);
			},
			() => {
				// ignore background metadata fetch errors
			},
		);
	}
}

// #endregion

// #region helpers

const buildSessionData = (
	service: string,
	raw: ComAtprotoServerCreateSession.$output & { pdsUri?: string },
): PasswordSessionData => {
	const didDoc = raw.didDoc as DidDocument | undefined;

	let pdsUri = raw.pdsUri;
	if (didDoc) {
		pdsUri = getPdsEndpoint(didDoc) ?? pdsUri;
	}

	return {
		service,
		accessJwt: raw.accessJwt,
		refreshJwt: raw.refreshJwt,
		handle: raw.handle,
		did: raw.did,
		pdsUri,
		email: raw.email,
		emailConfirmed: raw.emailConfirmed,
		emailAuthFactor: raw.emailAuthFactor,
		active: raw.active ?? true,
		inactiveStatus: raw.status,
	};
};

/**
 * parse a login URL into credentials.
 * format: `https://identifier:password@service`
 * @param input URL string or URL object
 * @returns parsed credentials
 */
const parseLoginUrl = (input: string | URL): PasswordSessionLoginCredentials => {
	const url = typeof input === 'string' ? new URL(input) : input;

	if (url.pathname !== '/') {
		throw new TypeError(`invalid login URL: unexpected pathname`);
	}
	if (url.hash) {
		throw new TypeError(`invalid login URL: unexpected hash`);
	}
	if (url.search) {
		throw new TypeError(`invalid login URL: unexpected search parameters`);
	}
	if (!url.username || !url.password) {
		throw new TypeError(`invalid login URL: missing identifier or password`);
	}

	return {
		service: url.origin,
		identifier: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password),
	};
};

/** decode a JWT token's payload */
const decodeJwt = (token: string): unknown => {
	const part = token.split('.')[1];
	if (typeof part !== 'string') {
		throw new Error(`invalid token: missing part 2`);
	}

	let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
	switch (b64.length % 4) {
		case 0:
			break;
		case 2:
			b64 += '==';
			break;
		case 3:
			b64 += '=';
			break;
		default:
			throw new Error(`invalid token: invalid base64 length`);
	}

	return JSON.parse(atob(b64));
};

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

// #endregion
