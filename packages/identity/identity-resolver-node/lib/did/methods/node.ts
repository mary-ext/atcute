import dns from 'node:dns/promises';

import { isAtprotoDid } from '@atcute/identity';
import {
	AmbiguousHandleError,
	DidNotFoundError,
	FailedHandleResolutionError,
	type HandleResolver,
	InvalidResolvedHandleError,
	type ResolveHandleOptions,
} from '@atcute/identity-resolver';
import type { AtprotoDid, Handle } from '@atcute/lexicons/syntax';

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

		let did: string | undefined;

		for (const record of results) {
			const data = record.join('').replace(/^"|"$/g, '').replace(/\\"/g, '"');

			if (!data.startsWith(PREFIX)) {
				continue;
			}

			if (did !== undefined) {
				throw new AmbiguousHandleError(handle);
			}

			did = data.slice(PREFIX.length);
		}

		if (did === undefined) {
			// theoretically this shouldn't happen, it should've returned ENOTFOUND
			throw new DidNotFoundError(handle);
		}

		if (!isAtprotoDid(did)) {
			throw new InvalidResolvedHandleError(handle, did);
		}

		return did;
	}
}
