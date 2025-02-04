import { isAtprotoWebDid, isWebDid, webDidToDocumentUrl, type Did, type DidDocument } from '@atcute/identity';

import * as err from '../../errors.js';
import type { DidResolver, ResolveDidOptions } from '../../types.js';
import { fetchDocHandler } from '../../utils.js';

export interface WebDidResolverOptions {
	fetch?: typeof fetch;
}

export class WebDidResolver implements DidResolver<'web'> {
	#fetch: typeof fetch;

	constructor({ fetch: fetchThis = fetch }: WebDidResolverOptions = {}) {
		this.#fetch = fetchThis;
	}

	async resolve(did: Did<'web'>, options?: ResolveDidOptions): Promise<DidDocument> {
		if (!isWebDid(did)) {
			throw new err.ImproperDidError(did);
		}

		const url = webDidToDocumentUrl(did);

		const response = await (0, this.#fetch)(url, {
			signal: options?.signal,
			cache: options?.noCache ? 'no-cache' : 'default',
			redirect: 'error',
			headers: { accept: 'application/did+ld+json,application/json' },
		});

		const { json } = await fetchDocHandler(response);

		return json;
	}
}

export class AtprotoWebDidResolver implements DidResolver<'web'> {
	#fetch: typeof fetch;

	constructor({ fetch: fetchThis = fetch }: WebDidResolverOptions = {}) {
		this.#fetch = fetchThis;
	}

	async resolve(did: Did<'web'>, options?: ResolveDidOptions): Promise<DidDocument> {
		if (!isAtprotoWebDid(did)) {
			throw new err.ImproperDidError(did);
		}

		const url = webDidToDocumentUrl(did);

		const response = await (0, this.#fetch)(url, {
			signal: options?.signal,
			cache: options?.noCache ? 'no-cache' : 'default',
			redirect: 'error',
			headers: { accept: 'application/did+ld+json,application/json' },
		});

		const { json } = await fetchDocHandler(response);

		return json;
	}
}
