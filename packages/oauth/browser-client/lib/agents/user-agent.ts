import type { FetchHandlerObject } from '@atcute/client';
import type { At } from '@atcute/client/lexicons';

import { createDPoPFetch } from '../dpop.js';
import { CLIENT_ID } from '../environment.js';
import type { Session } from '../types/token.js';

import { OAuthServerAgent } from './server-agent.js';
import { type SessionGetOptions, deleteStoredSession, getSession } from './sessions.js';

export class OAuthUserAgent implements FetchHandlerObject {
	#fetch: typeof fetch;
	#getSessionPromise: Promise<Session> | undefined;

	constructor(public session: Session) {
		this.#fetch = createDPoPFetch(CLIENT_ID, session.dpopKey, false);
	}

	get sub(): At.DID {
		return this.session.info.sub;
	}

	getSession(options?: SessionGetOptions): Promise<Session> {
		const promise = getSession(this.session.info.sub, options);

		promise
			.then((session) => {
				this.session = session;
			})
			.finally(() => {
				this.#getSessionPromise = undefined;
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

		let response = await this.#fetch(url, { ...init, headers });
		if (!isInvalidTokenResponse(response)) {
			return response;
		}

		try {
			if (this.#getSessionPromise) {
				session = await this.#getSessionPromise;
			} else {
				session = await this.getSession();
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

		return await this.#fetch(url, { ...init, headers });
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
