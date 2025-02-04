import { isPlcDid, type Did, type DidDocument } from '@atcute/identity';

import * as err from '../errors.js';
import type { DidResolver, ResolveDidOptions } from '../types.js';
import { fetchDocHandler } from '../utils.js';

export interface PlcDidResolverOptions {
	apiUrl?: string;
	fetch?: typeof fetch;
}

export class PlcDidResolver implements DidResolver<'plc'> {
	#apiUrl: string;
	#fetch: typeof fetch;

	constructor({ apiUrl = 'https://plc.directory', fetch: fetchThis = fetch }: PlcDidResolverOptions = {}) {
		this.#apiUrl = apiUrl;
		this.#fetch = fetchThis;
	}

	async resolve(did: Did<'plc'>, options?: ResolveDidOptions): Promise<DidDocument> {
		if (!isPlcDid(did)) {
			throw new err.ImproperDidError(did);
		}

		const url = new URL(`/${encodeURIComponent(did)}`, this.#apiUrl);

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
