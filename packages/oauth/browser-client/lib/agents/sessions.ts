import type { At } from '@atcute/client/lexicons';

import { database } from '../environment.js';
import { OAuthResponseError, TokenRefreshError } from '../errors.js';
import type { Session } from '../types/token.js';
import { locks } from '../utils/runtime.js';

import { OAuthServerAgent } from './server-agent.js';

export interface SessionGetOptions {
	signal?: AbortSignal;
	noCache?: boolean;
	allowStale?: boolean;
}

type PendingItem<V> = Promise<{ value: V; isFresh: boolean }>;
const pending = new Map<At.DID, PendingItem<Session>>();

export const getSession = async (sub: At.DID, options?: SessionGetOptions): Promise<Session> => {
	options?.signal?.throwIfAborted();

	let allowStored = isTokenUsable;
	if (options?.noCache) {
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
	let previousExecutionFlow: PendingItem<Session> | undefined;
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

	const run = async (): PendingItem<Session> => {
		const storedSession = database.sessions.get(sub);

		if (storedSession && allowStored(storedSession)) {
			// Use the stored value as return value for the current execution
			// flow. Notify other concurrent execution flows (that should be
			// "stuck" in the loop before until this promise resolves) that we got
			// a value, but that it came from the store (isFresh = false).
			return { isFresh: false, value: storedSession };
		}

		const newSession = await refreshToken(sub, storedSession);

		await storeSession(sub, newSession);
		return { isFresh: true, value: newSession };
	};

	let promise: PendingItem<Session>;

	if (locks) {
		promise = locks.request(`atcute-oauth:${sub}`, run);
	} else {
		promise = run();
	}

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

export const storeSession = async (sub: At.DID, newSession: Session): Promise<void> => {
	try {
		database.sessions.set(sub, newSession);
	} catch (err) {
		await onRefreshError(newSession);
		throw err;
	}
};

export const deleteStoredSession = (sub: At.DID): void => {
	database.sessions.delete(sub);
};

export const listStoredSessions = (): At.DID[] => {
	return database.sessions.keys();
};

const returnTrue = () => true;
const returnFalse = () => false;

const refreshToken = async (sub: At.DID, storedSession: Session | undefined): Promise<Session> => {
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

const onRefreshError = async ({ dpopKey, info, token }: Session) => {
	// If the token data cannot be stored, let's revoke it
	const server = new OAuthServerAgent(info.server, dpopKey);
	await server.revoke(token.refresh ?? token.access);
};

const isTokenUsable = ({ token }: Session): boolean => {
	const expires = token.expires_at;
	return expires == null || Date.now() + 60_000 <= expires;
};
