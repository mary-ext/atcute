import { isAtprotoDid } from '@atcute/identity';
import type { AtprotoDid, Nsid } from '@atcute/lexicons/syntax';
import { type DohJsonTxtResult, fetchDohJsonTxt } from '@atcute/util-fetch';

import * as err from '../errors.ts';
import type { LexiconAuthorityResolver, ResolveLexiconAuthorityOptions } from '../types.ts';
import { nsidToLookupDomain } from '../utils.ts';

const SUBDOMAIN = '_lexicon';
const PREFIX = 'did=';

export interface DohJsonLexiconAuthorityResolverOptions {
	dohUrl: string;
	fetch?: typeof fetch;
}

export class DohJsonLexiconAuthorityResolver implements LexiconAuthorityResolver {
	readonly dohUrl: string;
	#fetch: typeof fetch;

	constructor({ dohUrl, fetch: fetchThis = fetch }: DohJsonLexiconAuthorityResolverOptions) {
		this.dohUrl = dohUrl;
		this.#fetch = fetchThis;
	}

	async resolve(nsid: Nsid, options?: ResolveLexiconAuthorityOptions): Promise<AtprotoDid> {
		const lookupDomain = nsidToLookupDomain(nsid);

		let json: DohJsonTxtResult;

		try {
			const url = new URL(this.dohUrl);
			url.searchParams.set('name', `${SUBDOMAIN}.${lookupDomain}`);
			url.searchParams.set('type', 'TXT');

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				headers: { accept: 'application/dns-json' },
			});

			const handled = await fetchDohJsonTxt(response);

			json = handled.json;
		} catch (cause) {
			throw new err.FailedAuthorityResolutionError(nsid, { cause });
		}

		const status = json.Status;
		const answers = json.Answer;

		if (status !== 0 /* NOERROR */) {
			if (status === 3 /* NXDOMAIN */) {
				throw new err.AuthorityNotFoundError(nsid);
			}

			throw new err.FailedAuthorityResolutionError(nsid, {
				cause: new TypeError(`dns returned ${status}`),
			});
		}

		for (let i = 0, il = answers.length; i < il; i++) {
			const answer = answers[i];
			const data = answer.data;

			if (!data.startsWith(PREFIX)) {
				continue;
			}

			for (let j = i + 1; j < il; j++) {
				const data = answers[j].data;
				if (data.startsWith(PREFIX)) {
					throw new err.AmbiguousAuthorityError(nsid);
				}
			}

			const did = data.slice(PREFIX.length);
			if (!isAtprotoDid(did)) {
				throw new err.InvalidResolvedAuthorityError(nsid, did);
			}

			return did;
		}

		// theoretically this shouldn't happen, it should've returned NXDOMAIN
		throw new err.AuthorityNotFoundError(nsid);
	}
}
