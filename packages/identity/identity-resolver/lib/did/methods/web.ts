import { webDidToDocumentUrl, type DidDocument } from '@atcute/identity';
import type { Did } from '@atcute/lexicons/syntax';
import { FailedResponseError } from '@atcute/util-fetch';

import * as err from '../../errors.ts';
import type { DidDocumentResolver, ResolveDidDocumentOptions } from '../../types.ts';
import { fetchDocHandler } from '../utils.ts';

export interface WebDidDocumentResolverOptions {
	fetch?: typeof fetch;
}

export class WebDidDocumentResolver implements DidDocumentResolver<'web'> {
	#fetch: typeof fetch;

	constructor({ fetch: fetchThis = fetch }: WebDidDocumentResolverOptions = {}) {
		this.#fetch = fetchThis;
	}

	async resolve(did: Did<'web'>, options?: ResolveDidDocumentOptions): Promise<DidDocument> {
		// quick sanity check
		if (!did.startsWith('did:web:')) {
			throw new err.UnsupportedDidMethodError(did);
		}

		let json: DidDocument;

		try {
			const url = webDidToDocumentUrl(did);

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				redirect: 'manual',
				headers: { accept: 'application/did+ld+json,application/json' },
			});

			if (response.status >= 300 && response.status < 400) {
				throw new TypeError(`unexpected redirect`);
			}

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
		// quick sanity check
		if (!did.startsWith('did:web:')) {
			throw new err.UnsupportedDidMethodError(did);
		}

		const [host, ...paths] = did.slice(8).split(':').map(decodeURIComponent);
		const url = new URL(`https://${host}/.well-known/did.json`);

		if (paths.length > 0) {
			throw new err.ImproperDidError(did);
		}

		let json: DidDocument;

		try {
			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				redirect: 'manual',
				headers: { accept: 'application/did+ld+json,application/json' },
			});

			if (response.status >= 300 && response.status < 400) {
				throw new TypeError(`unexpected redirect`);
			}

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
