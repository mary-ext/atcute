/**
 * @module
 * Contains a middleware that handles authentication to a personal data server.
 */

import { fetchHandler, isErrorResponse, XRPCError, type XRPC, type XRPCRequest } from '../index.js';
import type { At, ComAtprotoServerCreateSession, ComAtprotoServerRefreshSession } from '../lexicons.js';

import { getPdsEndpoint, type DidDocument } from '../utils/did.js';
import { decodeJwt } from '../utils/jwt.js';

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

/** Additional options for constructing an authentication middleware */
export interface AtpAuthOptions {
	/** This function gets called if the session turned out to have expired during an XRPC request */
	onExpired?: (session: AtpSessionData) => void;
	/** This function gets called if the session has been refreshed during an XRPC request */
	onRefresh?: (session: AtpSessionData) => void;
	/** This function gets called if the session object has been refreshed */
	onSessionUpdate?: (session: AtpSessionData) => void;
}

/** Authentication/session management middleware */
export class AtpAuth {
	#rpc: XRPC;
	#refreshSessionPromise?: Promise<void>;

	#onExpired: AtpAuthOptions['onExpired'];
	#onRefresh: AtpAuthOptions['onRefresh'];
	#onSessionUpdate: AtpAuthOptions['onSessionUpdate'];

	/** Current session state */
	session?: AtpSessionData;

	constructor(rpc: XRPC, { onExpired, onRefresh, onSessionUpdate }: AtpAuthOptions = {}) {
		this.#rpc = rpc;

		this.#onRefresh = onRefresh;
		this.#onExpired = onExpired;
		this.#onSessionUpdate = onSessionUpdate;

		rpc.hook((next) => async (request) => {
			await this.#refreshSessionPromise;

			let res = await next(this.#decorateRequest(request));

			if (isErrorResponse(res.body, ['ExpiredToken']) && this.session?.refreshJwt) {
				await this.#refreshSession();

				if (this.session) {
					// retry fetch
					res = await next(this.#decorateRequest(request));
				}
			}

			return res;
		});
	}

	#decorateRequest(req: XRPCRequest): XRPCRequest {
		const session = this.session;

		if (session && !req.headers['Authorization']) {
			return {
				...req,
				service: session.pdsUri || req.service,
				headers: {
					...req.headers,
					Authorization: `Bearer ${session.accessJwt}`,
				},
			};
		}

		return req;
	}

	#refreshSession() {
		return (this.#refreshSessionPromise ||= this.#refreshSessionInner().finally(() => {
			this.#refreshSessionPromise = undefined;
		}));
	}

	async #refreshSessionInner() {
		const session = this.session!;

		if (!session || !session.refreshJwt) {
			return;
		}

		const res = await fetchHandler({
			service: session.pdsUri || this.#rpc.service,
			type: 'post',
			nsid: 'com.atproto.server.refreshSession',
			headers: {
				Authorization: `Bearer ${session.refreshJwt}`,
			},
			params: {},
		});

		if (isErrorResponse(res.body, ['ExpiredToken', 'InvalidToken'])) {
			// failed due to a bad refresh token
			this.session = undefined;
			this.#onExpired?.(session);
		} else if (res.status === 200) {
			// succeeded, update the session
			this.#updateSession({ ...session, ...(res.body as ComAtprotoServerRefreshSession.Output) });
			this.#onRefresh?.(this.session!);
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
			const promise = this.#rpc.get('com.atproto.server.getSession', {});

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

		const res = await this.#rpc.call('com.atproto.server.createSession', {
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
