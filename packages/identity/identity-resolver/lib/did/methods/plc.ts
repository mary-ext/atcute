import type { DidDocument } from '@atcute/identity';
import type { Did } from '@atcute/lexicons/syntax';
import { FailedResponseError } from '@atcute/util-fetch';

import * as err from '../../errors.js';
import type { DidDocumentResolver, ResolveDidDocumentOptions } from '../../types.js';
import { fetchDocHandler } from '../utils.js';

export interface PlcDidDocumentResolverOptions {
	apiUrl?: string;
	fetch?: typeof fetch;
}

export class PlcDidDocumentResolver implements DidDocumentResolver<'plc'> {
	readonly apiUrl: string;
	#fetch: typeof fetch;

	constructor({
		apiUrl = 'https://plc.directory',
		fetch: fetchThis = fetch,
	}: PlcDidDocumentResolverOptions = {}) {
		this.apiUrl = apiUrl;
		this.#fetch = fetchThis;
	}

	async resolve(did: Did<'plc'>, options?: ResolveDidDocumentOptions): Promise<DidDocument> {
		// quick sanity check
		if (!did.startsWith('did:plc:')) {
			throw new err.UnsupportedDidMethodError(did);
		}

		let json: DidDocument;

		try {
			const url = new URL(`/${encodeURIComponent(did)}`, this.apiUrl);

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
