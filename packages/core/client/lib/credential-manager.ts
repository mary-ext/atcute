import type { At, ComAtprotoServerCreateSession } from './lexicons.js';

import { simpleFetchHandler, type FetchHandlerObject } from './fetch-handler.js';
import { XRPC, XRPCError } from './rpc.js';

import { getPdsEndpoint, type DidDocument } from './utils/did.js';
import { decodeJwt } from './utils/jwt.js';

/** Interface for the decoded access token, for convenience */
export interface AtpAccessJwt {
	/** Access token scope, app password returns a different scope. */
	scope: 'com.atproto.access' | 'com.atproto.appPass' | 'com.atproto.appPassPrivileged';
	/** Account DID */
	sub: At.DID;
	/** Expiration time */
	exp: number;
	/** Creation/issued time */
	iat: number;
}

/** Interface for the decoded refresh token, for convenience */
export interface AtpRefreshJwt {
	/** Refresh token scope */
	scope: 'com.atproto.refresh';
	/** ID of this refresh token */
	jti: string;
	/** Account DID */
	sub: At.DID;
	/** Intended audience of this refresh token, in DID */
	aud: At.DID;
	/** Expiration time */
	exp: number;
	/** Creation/issued time */
	iat: number;
}

/** Saved session data, this can be reused again for next time. */
export interface AtpSessionData {
	/** Refresh token */
	refreshJwt: string;
	/** Access token */
	accessJwt: string;
	/** Account handle */
	handle: string;
	/** Account DID */
	did: At.DID;
	/** PDS endpoint found in the DID document, this will be used as the service URI if provided */
	pdsUri?: string;
	/** Email address of the account, might not be available if on app password */
	email?: string;
	/** If the email address has been confirmed or not */
	emailConfirmed?: boolean;
	/** If the account has email-based two-factor authentication enabled */
	emailAuthFactor?: boolean;
	/** Whether the account is active (not deactivated, taken down, or suspended) */
	active: boolean;
	/** Possible reason for why the account is inactive */
	inactiveStatus?: string;
}

export interface CredentialManagerOptions {
	/** PDS server URL */
	service: string;

	/** Custom fetch function */
	fetch?: typeof globalThis.fetch;

	/** Function that gets called if the session turned out to have expired during an XRPC request */
	onExpired?: (session: AtpSessionData) => void;
	/** Function that gets called if the session has been refreshed during an XRPC request */
	onRefresh?: (session: AtpSessionData) => void;
	/** Function that gets called if the session object has been refreshed */
	onSessionUpdate?: (session: AtpSessionData) => void;
}

export class CredentialManager implements FetchHandlerObject {
	readonly serviceUrl: string;
	fetch: typeof fetch;

	#server: XRPC;
	#refreshSessionPromise: Promise<void> | undefined;

	#onExpired: CredentialManagerOptions['onExpired'];
	#onRefresh: CredentialManagerOptions['onRefresh'];
	#onSessionUpdate: CredentialManagerOptions['onSessionUpdate'];

	/** Current session state */
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

		this.#server = new XRPC({ handler: simpleFetchHandler({ service: service, fetch: _fetch }) });

		this.#onRefresh = onRefresh;
		this.#onExpired = onExpired;
		this.#onSessionUpdate = onSessionUpdate;
	}

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

		headers.set('authorization', `Bearer ${this.session.accessJwt}`);

		const initialResponse = await (0, this.fetch)(url, { ...init, headers });
		const isExpired = await isExpiredTokenResponse(initialResponse);

		if (!isExpired) {
			return initialResponse;
		}

		try {
			await this.#refreshSession();
		} catch {
			return initialResponse;
		}

		// Return initial response if:
		// - refreshSession returns expired
		// - Body stream has been consumed
		if (!this.session || init.body instanceof ReadableStream) {
			return initialResponse;
		}

		headers.set('authorization', `Bearer ${this.session.accessJwt}`);

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

		try {
			const { data } = await this.#server.call('com.atproto.server.refreshSession', {
				headers: {
					authorization: `Bearer ${currentSession.refreshJwt}`,
				},
			});

			this.#updateSession({ ...currentSession, ...data });
			this.#onRefresh?.(this.session!);
		} catch (err) {
			if (err instanceof XRPCError) {
				const kind = err.kind;

				if (kind === 'ExpiredToken' || kind === 'InvalidToken') {
					this.session = undefined;
					this.#onExpired?.(currentSession);
				}
			}
		}
	}

	#updateSession(raw: ComAtprotoServerCreateSession.Output): AtpSessionData {
		const didDoc = raw.didDoc as DidDocument | undefined;

		let pdsUri: string | undefined;
		if (didDoc) {
			pdsUri = getPdsEndpoint(didDoc);
		}

		const newSession = {
			accessJwt: raw.accessJwt,
			refreshJwt: raw.refreshJwt,
			handle: raw.handle,
			did: raw.did,
			pdsUri: pdsUri,
			email: raw.email,
			emailConfirmed: raw.emailConfirmed,
			emailAuthFactor: raw.emailConfirmed,
			active: raw.active ?? true,
			inactiveStatus: raw.status,
		};

		this.session = newSession;
		this.#onSessionUpdate?.(newSession);

		return newSession;
	}

	/**
	 * Resume a saved session
	 * @param session Session information, taken from `AtpAuth#session` after login
	 */
	async resume(session: AtpSessionData): Promise<AtpSessionData> {
		const now = Date.now() / 1000 + 60 * 5;

		const refreshToken = decodeJwt(session.refreshJwt) as AtpRefreshJwt;

		if (now >= refreshToken.exp) {
			throw new XRPCError(401, { kind: 'InvalidToken' });
		}

		const accessToken = decodeJwt(session.accessJwt) as AtpAccessJwt;
		this.session = session;

		if (now >= accessToken.exp) {
			await this.#refreshSession();
		} else {
			const promise = this.#server.get('com.atproto.server.getSession', {
				headers: {
					authorization: `Bearer ${session.accessJwt}`,
				},
			});

			promise.then((response) => {
				const existing = this.session;
				const next = response.data;

				if (!existing) {
					return;
				}

				this.#updateSession({ ...existing, ...next });
			});
		}

		if (!this.session) {
			throw new XRPCError(401, { kind: 'InvalidToken' });
		}

		return this.session;
	}

	/**
	 * Perform a login operation
	 * @param options Login options
	 * @returns Session data that can be saved for later
	 */
	async login(options: AuthLoginOptions): Promise<AtpSessionData> {
		// Reset the session
		this.session = undefined;

		const res = await this.#server.call('com.atproto.server.createSession', {
			data: {
				identifier: options.identifier,
				password: options.password,
				authFactorToken: options.code,
			},
		});

		return this.#updateSession(res.data);
	}
}

/** Login options */
export interface AuthLoginOptions {
	/** What account to login as, this could be domain handle, DID, or email address */
	identifier: string;
	/** Account password */
	password: string;
	/** Two-factor authentication code */
	code?: string;
}

const isExpiredTokenResponse = async (response: Response): Promise<boolean> => {
	if (response.status !== 400) {
		return false;
	}

	if (extractContentType(response.headers) !== 'application/json') {
		return false;
	}

	// {"error":"ExpiredToken","message":"Token has expired"}
	// {"error":"ExpiredToken","message":"Token is expired"}
	if (extractContentLength(response.headers) > 54 * 1.5) {
		return false;
	}

	try {
		const { error, message } = await response.clone().json();
		return error === 'ExpiredToken' && (typeof message === 'string' || message === undefined);
	} catch {}

	return false;
};

const extractContentType = (headers: Headers) => {
	return headers.get('content-type')?.split(';')[0]?.trim();
};
const extractContentLength = (headers: Headers) => {
	return Number(headers.get('content-length') ?? ';');
};
