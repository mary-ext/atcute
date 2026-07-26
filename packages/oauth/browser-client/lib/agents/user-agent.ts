import type { FetchHandlerObject } from '@atcute/client';
import type { Did } from '@atcute/lexicons';

import { createDPoPFetch } from '../dpop.ts';
import type { Session } from '../types/token.ts';

import { OAuthServerAgent } from './server-agent.ts';
import { type SessionGetOptions, deleteStoredSession, getSession } from './sessions.ts';

export class OAuthUserAgent implements FetchHandlerObject {
	#fetch: typeof fetch;
	#getSessionPromise: Promise<Session> | undefined;

	session: Session;

	constructor(session: Session) {
		this.session = session;
		this.#fetch = createDPoPFetch(session.dpopKey, false);
	}

	get sub(): Did {
		return this.session.info.sub;
	}

	getSession(options?: SessionGetOptions): Promise<Session> {
		const promise = getSession(this.session.info.sub, options);

		promise
			.then(
				(session) => {
					this.#adoptSession(session);
				},
				() => {},
			)
			.finally(() => {
				// a later call may already own the field by now
				if (this.#getSessionPromise === promise) {
					this.#getSessionPromise = undefined;
				}
			});

		return (this.#getSessionPromise = promise);
	}

	async signOut(): Promise<void> {
		const sub = this.session.info.sub;

		try {
			const { dpopKey, info, token } = await getSession(sub, { allowStale: true });
			const server = new OAuthServerAgent(info.server, dpopKey);

			await server.revoke(token.refresh ?? token.access);
		} finally {
			deleteStoredSession(sub);
		}
	}

	async handle(pathname: string, init?: RequestInit): Promise<Response> {
		await this.#getSessionPromise;

		const headers = new Headers(init?.headers);

		let session = this.session;
		let url = new URL(pathname, session.info.aud);

		headers.set('authorization', `${session.token.type} ${session.token.access}`);

		const response = await this.#fetch(url.href, { ...init, headers });
		if (!isInvalidTokenResponse(response)) {
			return response;
		}

		const rejected = session.token.access;

		try {
			const inflight = this.#getSessionPromise;
			session = inflight ? await inflight : await this.getSession({ staleAccessToken: rejected });

			if (session.token.access === rejected) {
				// the in-flight call had no way of knowing this token went stale early
				session = await this.getSession({ staleAccessToken: rejected });
			}
		} catch {
			return response;
		}

		// Stream already consumed, can't retry.
		if (init?.body instanceof ReadableStream) {
			return response;
		}

		url = new URL(pathname, session.info.aud);
		headers.set('authorization', `${session.token.type} ${session.token.access}`);

		return await this.#fetch(url.href, { ...init, headers });
	}

	#adoptSession(session: Session): void {
		// a reauthorization elsewhere mints a new DPoP key, the old signer would bind
		// requests to a key the new token is not bound to
		if (session.dpopKey.d !== this.session.dpopKey.d) {
			this.#fetch = createDPoPFetch(session.dpopKey, false);
		}

		this.session = session;
	}
}

const isInvalidTokenResponse = (response: Response) => {
	if (response.status !== 401) {
		return false;
	}

	const auth = response.headers.get('www-authenticate');

	return (
		auth != null &&
		(auth.startsWith('Bearer ') || auth.startsWith('DPoP ')) &&
		auth.includes('error="invalid_token"')
	);
};
