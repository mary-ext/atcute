import dns from 'node:dns/promises';

import { isAtprotoDid } from '@atcute/identity';
import {
	AmbiguousAuthorityError,
	AuthorityNotFoundError,
	FailedAuthorityResolutionError,
	InvalidResolvedAuthorityError,
	type LexiconAuthorityResolver,
	type ResolveLexiconAuthorityOptions,
	nsidToLookupDomain,
} from '@atcute/lexicon-resolver';
import type { AtprotoDid, Nsid } from '@atcute/lexicons/syntax';

const SUBDOMAIN = '_lexicon';
const PREFIX = 'did=';

export interface NodeDnsLexiconAuthorityResolverOptions {
	nameservers?: string[];
}

export class NodeDnsLexiconAuthorityResolver implements LexiconAuthorityResolver {
	#resolver: dns.Resolver | null = null;

	get nameservers(): string[] | undefined {
		return this.#resolver?.getServers();
	}

	constructor({ nameservers }: NodeDnsLexiconAuthorityResolverOptions = {}) {
		if (nameservers) {
			this.#resolver = new dns.Resolver();
			this.#resolver.setServers(nameservers);
		}
	}

	async resolve(nsid: Nsid, options?: ResolveLexiconAuthorityOptions): Promise<AtprotoDid> {
		const lookupDomain = nsidToLookupDomain(nsid);

		let results: string[][];

		try {
			const signal = options?.signal;
			const resolver = this.#resolver ?? dns;

			results = await resolver.resolveTxt(`${SUBDOMAIN}.${lookupDomain}`);
			signal?.throwIfAborted();
		} catch (cause) {
			if (cause instanceof Error && 'code' in cause && cause.code === 'ENOTFOUND') {
				throw new AuthorityNotFoundError(nsid);
			}

			throw new FailedAuthorityResolutionError(nsid, { cause });
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
					throw new AmbiguousAuthorityError(nsid);
				}
			}

			const did = data.slice(PREFIX.length);
			if (!isAtprotoDid(did)) {
				throw new InvalidResolvedAuthorityError(nsid, did);
			}

			return did;
		}

		// theoretically this shouldn't happen, it should've returned ENOTFOUND
		throw new AuthorityNotFoundError(nsid);
	}
}
