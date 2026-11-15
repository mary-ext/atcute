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
	sessionId: string;
	session: StoredSession;
}

export interface SessionDeletedEvent {
	type: 'deleted';
	sub: Did;
	sessionId: string;
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
	 * only needed for multi-process/distributed deployments where multiple instances might try to refresh the
	 * same session concurrently. single-process deployments can omit this.
	 */
	requestLock?: LockFunction;
}

/**
 * manages session retrieval and automatic token refresh.
 *
 * wraps a session store with caching and staleness checking. automatically refreshes tokens when they're
 * about to expire.
 */
export class SessionGetter extends CachedGetter<string, StoredSession> {
	private readonly listeners = new Set<SessionEventListener>();
	private readonly requestLock: LockFunction | undefined;

	constructor(options: SessionGetterOptions) {
		const { sessionStore, serverFactory, requestLock } = options;

		super(
			// getter function - refreshes the token
			async (sessionId, opts, storedSession) => {
				if (storedSession === undefined) {
					throw new TokenRefreshError(sessionId, 'session was deleted by another process', {
						sessionId,
					});
				}

				const { dpopKey, authMethod, tokenSet } = storedSession;

				if (!tokenSet.refresh_token) {
					throw new TokenRefreshError(tokenSet.sub, 'no refresh token available', { sessionId });
				}

				const server = await serverFactory.fromIssuer(tokenSet.iss, authMethod, dpopKey);

				// don't abort after this point - refresh tokens are single-use
				opts.signal?.throwIfAborted();

				try {
					const newTokenSet = await server.refresh(tokenSet);

					if (tokenSet.sub !== newTokenSet.sub) {
						throw new TokenRefreshError(tokenSet.sub, 'token set sub mismatch after refresh', {
							sessionId,
						});
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
						throw new TokenRefreshError(tokenSet.sub, msg, { cause, sessionId });
					}

					if (cause instanceof TokenRefreshError && cause.sessionId === undefined) {
						throw new TokenRefreshError(cause.sub, cause.message, {
							cause: cause.cause ?? cause,
							sessionId,
						});
					}

					throw cause;
				}
			},
			sessionStore,
			{
				isStale(_sessionId, { tokenSet }) {
					if (tokenSet.expires_at == null) {
						return false;
					}
					// refresh if token expires within 10-40 seconds (randomized to reduce concurrent refreshes)
					const buffer = 10_000 + 30_000 * Math.random();
					return tokenSet.expires_at < Date.now() + buffer;
				},
				async onStoreError(err, _sessionId, { tokenSet, dpopKey, authMethod }) {
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

	/** adds a listener for session events. */
	addEventListener(listener: SessionEventListener): void {
		this.listeners.add(listener);
	}

	/** removes a session event listener. */
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

	override async setStored(sessionId: string, session: StoredSession): Promise<void> {
		await super.setStored(sessionId, session);
		this.dispatchEvent({ type: 'updated', sub: session.tokenSet.sub, sessionId, session });
	}

	override async deleteStored(
		sessionId: string,
		cause?: unknown,
		sessionOrSub?: StoredSession | Did,
	): Promise<void> {
		const sub = typeof sessionOrSub === 'string' ? sessionOrSub : sessionOrSub?.tokenSet.sub;
		await super.deleteStored(sessionId, cause);
		if (sub !== undefined) {
			this.dispatchEvent({ type: 'deleted', sub, sessionId, cause });
		}
	}

	/**
	 * gets a session, optionally forcing a refresh.
	 *
	 * @param sessionId session ID (user's DID by default)
	 * @param refresh true to force refresh, false to allow stale, 'auto' for normal behavior
	 * @returns session data
	 */
	async getSession(sessionId: string, refresh: boolean | 'auto' = 'auto'): Promise<StoredSession> {
		return this.get(sessionId, {
			noCache: refresh === true,
			allowStale: refresh === false,
		});
	}

	override async get(sessionId: string, options?: GetCachedOptions): Promise<StoredSession> {
		const signal = options?.signal ?? AbortSignal.timeout(30_000);

		let session: StoredSession;
		if (this.requestLock) {
			session = await this.requestLock(`oauth-session-${sessionId}`, async () => {
				return await super.get(sessionId, { ...options, signal });
			});
		} else {
			session = await super.get(sessionId, { ...options, signal });
		}

		return session;
	}
}
