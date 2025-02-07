import dns from 'node:dns/promises';

import { isAtprotoDid, type AtprotoDid, type Handle } from '@atcute/identity';
import {
	AmbiguousHandleError,
	DidNotFoundError,
	FailedHandleResolutionError,
	InvalidResolvedHandleError,
	type HandleResolver,
	type ResolveHandleOptions,
} from '@atcute/identity-resolver';

const SUBDOMAIN = '_atproto';
const PREFIX = 'did=';

export interface NodeDnsHandleResolverOptions {
	nameservers?: string[];
}

export class NodeDnsHandleResolver implements HandleResolver {
	#resolver: dns.Resolver | null = null;

	get nameservers(): string[] | undefined {
		return this.#resolver?.getServers();
	}

	constructor({ nameservers }: NodeDnsHandleResolverOptions = {}) {
		if (nameservers) {
			this.#resolver = new dns.Resolver();
			this.#resolver.setServers(nameservers);
		}
	}

	async resolve(handle: Handle, options?: ResolveHandleOptions): Promise<AtprotoDid> {
		let results: string[][];

		try {
			const signal = options?.signal;
			const resolver = this.#resolver ?? dns;

			results = await resolver.resolveTxt(`${SUBDOMAIN}.${handle}`);
			signal?.throwIfAborted();
		} catch (cause) {
			if (cause instanceof Error && 'code' in cause && cause.code === 'ENOTFOUND') {
				throw new DidNotFoundError(handle);
			}

			throw new FailedHandleResolutionError(handle, { cause });
		}

		const records = results.map((record) => record.join('').replace(/^"|"$/g, '').replace(/\\"/g, '"'));
		for (let i = 0, il = records.length; i < il; i++) {
			const data = records[i];

			if (!data.startsWith(PREFIX)) {
				continue;
			}

			for (let j = i + 1; j < il; j++) {
				const data = records[j];
				if (data.startsWith(PREFIX)) {
					throw new AmbiguousHandleError(handle);
				}
			}

			const did = data.slice(PREFIX.length);
			if (!isAtprotoDid(did)) {
				throw new InvalidResolvedHandleError(handle, did);
			}

			return did;
		}

		// theoretically this shouldn't happen, it should've returned ENOTFOUND
		throw new DidNotFoundError(handle);
	}
}
