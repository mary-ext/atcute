import * as v from '@badrap/valita';

import { isAtprotoDid } from '@atcute/identity';
import type { AtprotoDid, Nsid } from '@atcute/lexicons/syntax';
import { isResponseOk, parseResponseAsJson, pipe, validateJsonWith } from '@atcute/util-fetch';

import * as err from '../errors.js';
import type { LexiconAuthorityResolver, ResolveLexiconAuthorityOptions } from '../types.js';
import { nsidToLookupDomain } from '../utils.js';

const uint32 = v.number().assert((input) => Number.isInteger(input) && input >= 0 && input <= 2 ** 32 - 1);

const question = v.object({
	name: v.string(),
	type: v.literal(16), // TXT
});

const answer = v.object({
	name: v.string(),
	type: v.literal(16), // TXT
	TTL: uint32,
	data: v.string().chain((input) => {
		return v.ok(input.replace(/^"|"$/g, '').replace(/\\"/g, '"'));
	}),
});

const authority = v.object({
	name: v.string(),
	type: uint32,
	TTL: uint32,
	data: v.string(),
});

const result = v.object({
	/** DNS response code */
	Status: uint32,
	/** Whether response is truncated */
	TC: v.boolean(),
	/** Whether recursive desired bit is set, always true for Google and Cloudflare DoH */
	RD: v.boolean(),
	/** Whether recursive available bit is set, always true for Google and Cloudflare DoH */
	RA: v.boolean(),
	/** Whether response data was validated with DNSSEC */
	AD: v.boolean(),
	/** Whether client asked to disable DNSSEC validation */
	CD: v.boolean(),
	/** Requested records */
	Question: v.tuple([question]),
	/** Answers */
	Answer: v.array(answer).optional(() => []),
	/** Authority */
	Authority: v.array(authority).optional(),
	/** Comment from the DNS server */
	Comment: v.union(v.string(), v.array(v.string())).optional(),
});

const SUBDOMAIN = '_lexicon';
const PREFIX = 'did=';

const fetchDohJsonHandler = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/(dns-)?json$/, 16 * 1024),
	validateJsonWith(result, { mode: 'passthrough' }),
);

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

		let json: v.Infer<typeof result>;

		try {
			const url = new URL(this.dohUrl);
			url.searchParams.set('name', `${SUBDOMAIN}.${lookupDomain}`);
			url.searchParams.set('type', 'TXT');

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				headers: { accept: 'application/dns-json' },
			});

			const handled = await fetchDohJsonHandler(response);

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
