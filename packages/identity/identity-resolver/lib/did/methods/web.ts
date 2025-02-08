import { webDidToDocumentUrl, type Did, type DidDocument } from '@atcute/identity';
import { FailedResponseError } from '@atcute/util-fetch';

import * as err from '../../errors.js';
import type { DidDocumentResolver, ResolveDidDocumentOptions } from '../../types.js';
import { fetchDocHandler } from '../utils.js';

export interface WebDidDocumentResolverOptions {
	fetch?: typeof fetch;
}

export class WebDidDocumentResolver implements DidDocumentResolver<'web'> {
	#fetch: typeof fetch;

	constructor({ fetch: fetchThis = fetch }: WebDidDocumentResolverOptions = {}) {
		this.#fetch = fetchThis;
	}

	async resolve(did: Did<'web'>, options?: ResolveDidDocumentOptions): Promise<DidDocument> {
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

export class AtprotoWebDidDocumentResolver implements DidDocumentResolver<'web'> {
	#fetch: typeof fetch;

	constructor({ fetch: fetchThis = fetch }: WebDidDocumentResolverOptions = {}) {
		this.#fetch = fetchThis;
	}

	async resolve(did: Did<'web'>, options?: ResolveDidDocumentOptions): Promise<DidDocument> {
		const [host, ...paths] = did.slice(8).split(':').map(decodeURIComponent);
		const url = new URL(`https://${host}/.well-known/did.json`);

		if (url.hostname === 'localhost' || paths.length > 0) {
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
