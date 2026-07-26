import type { Did } from '@atcute/lexicons';

import { database, onPersistError } from '../environment.ts';
import { OAuthResponseError, TokenRefreshError } from '../errors.ts';
import type { StoredRecord } from '../types/store.ts';
import type { Session } from '../types/token.ts';
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

/** how long to wait for another document's rotation to reach us before giving up on a grant */
const RECONCILE_TIMEOUT = 2_000;

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
		const record = await readSessionRecord(sub);

		if (record === undefined) {
			throw new TokenRefreshError(sub, `session deleted by another tab`);
		}

		if (staleAccessToken !== undefined && record.value.token.access !== staleAccessToken) {
			// already rotated past the token the caller was told to discard
			return { isFresh: true, value: record.value };
		}

		if (allowStored(record.value)) {
			// Use the stored value as return value for the current execution
			// flow. Notify other concurrent execution flows (that should be
			// "stuck" in the loop before until this promise resolves) that we got
			// a value, but that it came from the store (isFresh = false).
			return { isFresh: false, value: record.value };
		}

		const { rotated, session } = await refreshToken(sub, record);

		if (rotated) {
			storeSession(sub, session);
		}

		return { isFresh: true, value: session };
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
	} catch (err) {
		// not fatal, the store keeps the session in memory; only surviving a reload is lost
		onPersistError?.(sub, err);
	}
};

export const deleteStoredSession = (sub: Did): void => {
	database.sessions.delete(sub);
};

export const listStoredSessions = (): Did[] => {
	return database.sessions.keys();
};

const returnTrue = () => true;
const returnFalse = () => false;

const readSessionRecord = async (sub: Did): Promise<StoredRecord<Session> | undefined> => {
	const record = database.sessions.getRecord(sub);
	if (record === undefined) {
		return;
	}

	const session = record.value;
	if (!isLegacyDpopKey(session.dpopKey)) {
		return record as StoredRecord<Session>;
	}

	const dpopKey = await migrateLegacyDpopKey(session.dpopKey);

	try {
		database.sessions.set(sub, { ...session, dpopKey });
	} catch {
		// ignore persistence errors, the store retains it either way
	}

	return database.sessions.getRecord(sub) as StoredRecord<Session> | undefined;
};

/** waits up to {@link RECONCILE_TIMEOUT} for the stored session to move off `revision` */
const waitForNewerRevision = async (sub: Did, revision: number): Promise<boolean> => {
	const changed = () => database.sessions.getRecord(sub)?.revision !== revision;

	if (changed()) {
		return true;
	}

	let unwatch: (() => void) | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;

	try {
		return await new Promise<boolean>((resolve) => {
			timer = setTimeout(() => resolve(false), RECONCILE_TIMEOUT);

			unwatch = database.sessions.watch((key) => {
				if (key === sub && changed()) {
					resolve(true);
				}
			});
		});
	} finally {
		clearTimeout(timer);
		unwatch?.();
	}
};

const refreshToken = async (
	sub: Did,
	record: StoredRecord<Session>,
): Promise<{ rotated: boolean; session: Session }> => {
	const { dpopKey, info, token } = record.value;
	const server = new OAuthServerAgent(info.server, dpopKey);

	try {
		const newToken = await server.refresh({ sub: info.sub, token });

		return { rotated: true, session: { dpopKey, info, token: newToken } };
	} catch (cause) {
		if (cause instanceof OAuthResponseError && cause.status === 400 && cause.error === 'invalid_grant') {
			// the refresh token rotates on every use, so this reads the same whether
			// another document spent it or the server revoked the session; wait for
			// their rotation before giving up
			if (await waitForNewerRevision(sub, record.revision)) {
				const reconciled = await readSessionRecord(sub);
				if (reconciled !== undefined) {
					return { rotated: false, session: reconciled.value };
				}
			}

			throw new TokenRefreshError(sub, `session was revoked`, { cause });
		}

		throw cause;
	}
};

const isTokenUsable = ({ token }: Session): boolean => {
	const expires = token.expires_at;
	return expires == null || Date.now() + 60_000 <= expires;
};
