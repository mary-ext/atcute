import { isAtprotoDid } from '@atcute/identity';
import type { AtprotoDid, Handle } from '@atcute/lexicons/syntax';
import { type DohJsonTxtResult, fetchDohJsonTxt } from '@atcute/util-fetch';

import * as err from '../../errors.ts';
import type { HandleResolver, ResolveHandleOptions } from '../../types.ts';

const SUBDOMAIN = '_atproto';
const PREFIX = 'did=';

export interface DohJsonHandleResolverOptions {
	dohUrl: string;
	fetch?: typeof fetch;
}

export class DohJsonHandleResolver implements HandleResolver {
	readonly dohUrl: string;
	#fetch: typeof fetch;

	constructor({ dohUrl, fetch: fetchThis = fetch }: DohJsonHandleResolverOptions) {
		this.dohUrl = dohUrl;
		this.#fetch = fetchThis;
	}

	async resolve(handle: Handle, options?: ResolveHandleOptions): Promise<AtprotoDid> {
		let json: DohJsonTxtResult;

		try {
			const url = new URL(this.dohUrl);
			url.searchParams.set('name', `${SUBDOMAIN}.${handle}`);
			url.searchParams.set('type', 'TXT');

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				headers: { accept: 'application/dns-json' },
			});

			const handled = await fetchDohJsonTxt(response);

			json = handled.json;
		} catch (cause) {
			throw new err.FailedHandleResolutionError(handle, { cause });
		}

		const status = json.Status;
		const answers = json.Answer;

		if (status !== 0 /* NOERROR */) {
			if (status === 3 /* NXDOMAIN */) {
				throw new err.DidNotFoundError(handle);
			}

			throw new err.FailedHandleResolutionError(handle, {
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
					throw new err.AmbiguousHandleError(handle);
				}
			}

			const did = data.slice(PREFIX.length);
			if (!isAtprotoDid(did)) {
				throw new err.InvalidResolvedHandleError(handle, did);
			}

			return did;
		}

		// theoretically this shouldn't happen, it should've returned NXDOMAIN
		throw new err.DidNotFoundError(handle);
	}
}
