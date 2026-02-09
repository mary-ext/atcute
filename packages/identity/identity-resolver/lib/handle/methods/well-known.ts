import { isAtprotoDid } from '@atcute/identity';
import type { AtprotoDid, Handle } from '@atcute/lexicons/syntax';
import { FailedResponseError, isResponseOk, pipe, readResponseAsText } from '@atcute/util-fetch';

import * as err from '../../errors.ts';
import type { HandleResolver, ResolveHandleOptions } from '../../types.ts';

export interface WellKnownHandleResolverOptions {
	fetch?: typeof fetch;
}

const fetchWellKnownHandler = pipe(isResponseOk, readResponseAsText(2048 + 16));

export class WellKnownHandleResolver implements HandleResolver {
	#fetch: typeof fetch;

	constructor({ fetch: fetchThis = fetch }: WellKnownHandleResolverOptions = {}) {
		this.#fetch = fetchThis;
	}

	async resolve(handle: Handle, options?: ResolveHandleOptions): Promise<AtprotoDid> {
		let text: string;

		try {
			const url = new URL('/.well-known/atproto-did', `https://${handle}`);

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				redirect: 'manual',
			});

			if (response.status >= 300 && response.status < 400) {
				throw new TypeError(`unexpected redirect`);
			}

			const handled = await fetchWellKnownHandler(response);

			text = handled.text;
		} catch (cause) {
			if (cause instanceof FailedResponseError && cause.status === 404) {
				throw new err.DidNotFoundError(handle);
			}

			throw new err.FailedHandleResolutionError(handle, { cause });
		}

		const did = text.split('\n')[0]!.trim();
		if (!isAtprotoDid(did)) {
			throw new err.InvalidResolvedHandleError(handle, did);
		}

		return did;
	}
}
