import type { Did } from '@atcute/lexicons';

import { database, onPersistError } from '../environment.ts';
import { OAuthResponseError, TokenRefreshError } from '../errors.ts';
import type { RawSession, Session } from '../types/token.ts';
import { isLegacyDpopKey, migrateLegacyDpopKey } from '../utils/dpop-key.ts';
import { getLockManager } from '../utils/runtime.ts';

import { OAuthServerAgent } from './server-agent.ts';

export interface SessionGetOptions {
	allowStale?: boolean;
	noCache?: boolean;
	signal?: AbortSignal;
	/**
	 * refresh only while the stored session still carries this access token, so that callers reacting to the
	 * same rejected token converge on a single refresh.
	 */
	staleAccessToken?: string;
}

type PendingItem<V> = { value: V; isFresh: boolean };
const pending = new Map<Did, Promise<PendingItem<Session>>>();

/**
 * sessions that were obtained but could not be persisted. the refresh token they carry is the only remaining
 * copy, since the one it replaced is already spent, so they are held for the lifetime of the document rather
 * than discarded.
 */
const volatileSessions = new Map<Did, Session>();

export const getSession = async (sub: Did, options?: SessionGetOptions): Promise<Session> => {
	options?.signal?.throwIfAborted();

	const staleAccessToken = options?.staleAccessToken;

	let allowStored = isTokenUsable;
	if (options?.noCache || staleAccessToken !== undefined) {
		allowStored = returnFalse;
	} else if (options?.allowStale) {
		allowStored = returnTrue;
	}

	// As long as concurrent requests are made for the same key, only one
	// request will be made to the cache & getter function at a time. This works
	// because there is no async operation between the while() loop and the
	// pending.set() call. Because of the "single threaded" nature of
	// JavaScript, the pending item will be set before the next iteration of the
	// while loop.
	let previousExecutionFlow: Promise<PendingItem<Session>> | undefined;
	while ((previousExecutionFlow = pending.get(sub))) {
		try {
			const { isFresh, value } = await previousExecutionFlow;

			if (isFresh || allowStored(value)) {
				return value;
			}
		} catch {
			// Ignore errors from previous execution flows (they will have been
			// propagated by that flow).
		}

		options?.signal?.throwIfAborted();
	}

	const run = async (): Promise<PendingItem<Session>> => {
		const storedSession = await readSession(sub);

		if (
			storedSession !== undefined &&
			staleAccessToken !== undefined &&
			storedSession.token.access !== staleAccessToken
		) {
			// already rotated past the token the caller was told to discard
			return { isFresh: true, value: storedSession };
		}

		if (storedSession && allowStored(storedSession)) {
			// Use the stored value as return value for the current execution
			// flow. Notify other concurrent execution flows (that should be
			// "stuck" in the loop before until this promise resolves) that we got
			// a value, but that it came from the store (isFresh = false).
			return { isFresh: false, value: storedSession };
		}

		const newSession = await refreshToken(sub, storedSession);

		storeSession(sub, newSession);
		return { isFresh: true, value: newSession };
	};

	// oxlint-disable-next-line typescript/no-explicit-any
	let promise = getLockManager().request<PendingItem<Session>>(`atcute-oauth:${sub}`, run as any);

	promise = promise.finally(() => pending.delete(sub));

	if (pending.has(sub)) {
		// This should never happen. Indeed, there must not be any 'await'
		// statement between this and the loop iteration check meaning that
		// this.pending.get returned undefined. It is there to catch bugs that
		// would occur in future changes to the code.
		throw new Error('concurrent request for the same key');
	}

	pending.set(sub, promise);

	const { value } = await promise;
	return value;
};

export const storeSession = (sub: Did, newSession: Session): void => {
	try {
		database.sessions.set(sub, newSession);
		volatileSessions.delete(sub);
	} catch (err) {
		// the token this one replaces is already spent, so discarding it would lose
		// the session outright. hold it in memory so the session dies with the
		// document instead of immediately.
		volatileSessions.set(sub, newSession);

		onPersistError?.(sub, err);
	}
};

export const deleteStoredSession = (sub: Did): void => {
	volatileSessions.delete(sub);
	database.sessions.delete(sub);
};

export const listStoredSessions = (): Did[] => {
	const keys = database.sessions.keys();

	for (const sub of volatileSessions.keys()) {
		if (!keys.includes(sub)) {
			keys.push(sub);
		}
	}

	return keys;
};

const returnTrue = () => true;
const returnFalse = () => false;

const readSession = async (sub: Did): Promise<Session | undefined> => {
	// only populated after a failed write, so storage necessarily holds something
	// older. reconciling this against a concurrent write from another tab needs
	// record revisions, which this store does not carry yet.
	const unpersisted = volatileSessions.get(sub);
	if (unpersisted !== undefined) {
		return unpersisted;
	}

	return await migrateSessionIfNeeded(sub, database.sessions.get(sub));
};

const refreshToken = async (sub: Did, storedSession: Session | undefined): Promise<Session> => {
	if (storedSession === undefined) {
		throw new TokenRefreshError(sub, `session deleted by another tab`);
	}

	const { dpopKey, info, token } = storedSession;
	const server = new OAuthServerAgent(info.server, dpopKey);

	try {
		const newToken = await server.refresh({ sub: info.sub, token });

		return { dpopKey, info, token: newToken };
	} catch (cause) {
		if (cause instanceof OAuthResponseError && cause.status === 400 && cause.error === 'invalid_grant') {
			throw new TokenRefreshError(sub, `session was revoked`, { cause });
		}

		throw cause;
	}
};

const isTokenUsable = ({ token }: Session): boolean => {
	const expires = token.expires_at;
	return expires == null || Date.now() + 60_000 <= expires;
};

const migrateSessionIfNeeded = async (
	sub: Did,
	session: RawSession | undefined,
): Promise<Session | undefined> => {
	if (!session || !isLegacyDpopKey(session.dpopKey)) {
		return session as Session | undefined;
	}

	const dpopKey = await migrateLegacyDpopKey(session.dpopKey);
	const migrated = { ...session, dpopKey };

	try {
		database.sessions.set(sub, migrated);
	} catch {
		// ignore persistence errors
	}

	return migrated;
};
