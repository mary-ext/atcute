import { isAtprotoDid, type Did, type Handle } from '@atcute/identity';
import { FailedResponseError, isResponseOk, pipe, readResponseAsText } from '@atcute/util-fetch';

import * as err from '../../errors.js';
import type { HandleResolver, ResolveHandleOptions } from '../../types.js';

export interface WellKnownHandleResolverOptions {
	fetch?: typeof fetch;
}

const fetchWellKnownHandler = pipe(isResponseOk, readResponseAsText(2048 + 16));

export class WellKnownHandleResolver implements HandleResolver {
	#fetch: typeof fetch;

	constructor({ fetch: fetchThis = fetch }: WellKnownHandleResolverOptions = {}) {
		this.#fetch = fetchThis;
	}

	async resolve(handle: Handle, options?: ResolveHandleOptions): Promise<Did> {
		let text: string;

		try {
			const url = new URL('/.well-known/atproto-did', `https://${handle}`);

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : 'default',
				redirect: 'error',
			});

			const handled = await fetchWellKnownHandler(response);

			text = handled.text;
		} catch (cause) {
			if (cause instanceof FailedResponseError && cause.status === 404) {
				throw new err.MissingDidError(handle);
			}

			throw new err.FailedDidResolutionError(handle, { cause });
		}

		const did = text.split('\n')[0]!.trim();
		if (!isAtprotoDid(did)) {
			throw new err.InvalidResolvedDidError(handle, did);
		}

		return did;
	}
}
