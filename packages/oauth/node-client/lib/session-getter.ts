import type { Did } from '@atcute/lexicons';

import {
	AuthMethodUnsatisfiableError,
	OAuthResponseError,
	TokenInvalidError,
	TokenRefreshError,
	TokenRevokedError,
} from './errors.ts';
import type { OAuthServerFactory } from './oauth-server-factory.ts';
import type { SessionStore, StoredSession } from './types/sessions.ts';
import { CachedGetter, type GetCachedOptions } from './utils/cached-getter.ts';
import type { LockFunction } from './utils/lock.ts';

export type { SessionStore, StoredSession };

export type SessionEventType = 'updated' | 'deleted';

export interface SessionUpdatedEvent {
	type: 'updated';
	sub: Did;
	session: StoredSession;
}

export interface SessionDeletedEvent {
	type: 'deleted';
	sub: Did;
	cause: unknown;
}

export type SessionEvent = SessionUpdatedEvent | SessionDeletedEvent;

export type SessionEventListener = (event: SessionEvent) => void;

export interface SessionGetterOptions {
	/** session store */
	sessionStore: SessionStore;
	/** server factory for creating OAuthServerAgent */
	serverFactory: OAuthServerFactory;
	/**
	 * lock function for coordinating token refresh across processes.
	 *
	 * only needed for multi-process/distributed deployments where multiple
	 * instances might try to refresh the same session concurrently.
	 * single-process deployments can omit this.
	 */
	requestLock?: LockFunction;
}

/**
 * manages session retrieval and automatic token refresh.
 *
 * wraps a session store with caching and staleness checking.
 * automatically refreshes tokens when they're about to expire.
 */
export class SessionGetter extends CachedGetter<Did, StoredSession> {
	private readonly listeners = new Set<SessionEventListener>();
	private readonly requestLock: LockFunction | undefined;

	constructor(options: SessionGetterOptions) {
		const { sessionStore, serverFactory, requestLock } = options;

		super(
			// getter function - refreshes the token
			async (sub, opts, storedSession) => {
				if (storedSession === undefined) {
					const cause = new TokenRefreshError(sub, 'session was deleted by another process');
					this.dispatchEvent({ type: 'deleted', sub, cause });
					throw cause;
				}

				const { dpopKey, authMethod, tokenSet } = storedSession;

				if (sub !== tokenSet.sub) {
					throw new TokenRefreshError(sub, 'stored session sub mismatch');
				}

				if (!tokenSet.refresh_token) {
					throw new TokenRefreshError(sub, 'no refresh token available');
				}

				const server = await serverFactory.fromIssuer(tokenSet.iss, authMethod, dpopKey);

				// don't abort after this point - refresh tokens are single-use
				opts.signal?.throwIfAborted();

				try {
					const newTokenSet = await server.refresh(tokenSet);

					if (sub !== newTokenSet.sub) {
						throw new TokenRefreshError(sub, 'token set sub mismatch after refresh');
					}

					return {
						dpopKey,
						authMethod: server.authMethod,
						tokenSet: newTokenSet,
					};
				} catch (cause) {
					// invalid_grant means token was revoked or already used
					if (
						cause instanceof OAuthResponseError &&
						cause.status === 400 &&
						cause.error === 'invalid_grant'
					) {
						const msg = cause.errorDescription ?? 'session was revoked';
						throw new TokenRefreshError(sub, msg, { cause });
					}

					throw cause;
				}
			},
			sessionStore,
			{
				isStale(_sub, { tokenSet }) {
					if (tokenSet.expires_at == null) {
						return false;
					}
					// refresh if token expires within 10-40 seconds (randomized to reduce concurrent refreshes)
					const buffer = 10_000 + 30_000 * Math.random();
					return tokenSet.expires_at < Date.now() + buffer;
				},
				async onStoreError(err, _sub, { tokenSet, dpopKey, authMethod }) {
					if (!(err instanceof AuthMethodUnsatisfiableError)) {
						try {
							const server = await serverFactory.fromIssuer(tokenSet.iss, authMethod, dpopKey);
							await server.revoke(tokenSet.refresh_token ?? tokenSet.access_token);
						} catch {
							// ignore revocation errors
						}
					}
					throw err;
				},
				deleteOnError(err) {
					return (
						err instanceof TokenRefreshError ||
						err instanceof TokenRevokedError ||
						err instanceof TokenInvalidError ||
						err instanceof AuthMethodUnsatisfiableError
					);
				},
			},
		);

		this.requestLock = requestLock;
	}

	/**
	 * adds a listener for session events.
	 */
	addEventListener(listener: SessionEventListener): void {
		this.listeners.add(listener);
	}

	/**
	 * removes a session event listener.
	 */
	removeEventListener(listener: SessionEventListener): void {
		this.listeners.delete(listener);
	}

	private dispatchEvent(event: SessionEvent): void {
		for (const listener of this.listeners) {
			try {
				listener(event);
			} catch {
				// ignore listener errors
			}
		}
	}

	override async setStored(sub: Did, session: StoredSession): Promise<void> {
		if (sub !== session.tokenSet.sub) {
			throw new TypeError('token set does not match the expected sub');
		}
		await super.setStored(sub, session);
		this.dispatchEvent({ type: 'updated', sub, session });
	}

	override async deleteStored(sub: Did, cause?: unknown): Promise<void> {
		await super.deleteStored(sub, cause);
		this.dispatchEvent({ type: 'deleted', sub, cause });
	}

	/**
	 * gets a session, optionally forcing a refresh.
	 *
	 * @param sub user's DID
	 * @param refresh true to force refresh, false to allow stale, 'auto' for normal behavior
	 * @returns session data
	 */
	async getSession(sub: Did, refresh: boolean | 'auto' = 'auto'): Promise<StoredSession> {
		return this.get(sub, {
			noCache: refresh === true,
			allowStale: refresh === false,
		});
	}

	override async get(sub: Did, options?: GetCachedOptions): Promise<StoredSession> {
		const signal = options?.signal ?? AbortSignal.timeout(30_000);

		let session: StoredSession;
		if (this.requestLock) {
			session = await this.requestLock(`oauth-session-${sub}`, async () => {
				return await super.get(sub, { ...options, signal });
			});
		} else {
			session = await super.get(sub, { ...options, signal });
		}

		if (sub !== session.tokenSet.sub) {
			throw new Error('token set does not match the expected sub');
		}

		return session;
	}
}
