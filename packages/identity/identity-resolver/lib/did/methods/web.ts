import { webDidToDocumentUrl, type Did, type DidDocument } from '@atcute/identity';
import { FailedResponseError } from '@atcute/util-fetch';

import * as err from '../../errors.js';
import type { DidResolver, ResolveDidOptions } from '../../types.js';
import { fetchDocHandler } from '../utils.js';

export interface WebDidResolverOptions {
	fetch?: typeof fetch;
}

export class WebDidResolver implements DidResolver<'web'> {
	#fetch: typeof fetch;

	constructor({ fetch: fetchThis = fetch }: WebDidResolverOptions = {}) {
		this.#fetch = fetchThis;
	}

	async resolve(did: Did<'web'>, options?: ResolveDidOptions): Promise<DidDocument> {
		let json: DidDocument;

		try {
			const url = webDidToDocumentUrl(did);

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : 'default',
				redirect: 'error',
				headers: { accept: 'application/did+ld+json,application/json' },
			});

			const handled = await fetchDocHandler(response);

			json = handled.json;
		} catch (cause) {
			if (cause instanceof FailedResponseError && cause.status === 404) {
				throw new err.DocumentNotFoundError(did);
			}

			throw new err.FailedDocumentResolutionError(did, { cause });
		}

		return json;
	}
}

export class AtprotoWebDidResolver implements DidResolver<'web'> {
	#fetch: typeof fetch;

	constructor({ fetch: fetchThis = fetch }: WebDidResolverOptions = {}) {
		this.#fetch = fetchThis;
	}

	async resolve(did: Did<'web'>, options?: ResolveDidOptions): Promise<DidDocument> {
		const url = webDidToDocumentUrl(did);
		if (url.hostname === 'localhost' || url.pathname !== '/.well-known/did.json') {
			throw new err.ImproperDidError(did);
		}

		let json: DidDocument;

		try {
			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : 'default',
				redirect: 'error',
				headers: { accept: 'application/did+ld+json,application/json' },
			});

			const handled = await fetchDocHandler(response);

			json = handled.json;
		} catch (cause) {
			if (cause instanceof FailedResponseError && cause.status === 404) {
				throw new err.DocumentNotFoundError(did);
			}

			throw new err.FailedDocumentResolutionError(did, { cause });
		}

		return json;
	}
}
