import * as v from '@badrap/valita';

import { isAtprotoDid, type AtprotoDid, type Handle } from '@atcute/identity';
import {
	FailedResponseError,
	isResponseOk,
	parseResponseAsJson,
	pipe,
	validateJsonWith,
} from '@atcute/util-fetch';

import * as err from '../../errors.js';
import type { HandleResolver, ResolveHandleOptions } from '../../types.js';

const response = v.object({
	did: v.string().assert((input) => isAtprotoDid(input)),
});

const fetchXrpcHandler = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/json$/, 4 * 1024),
	validateJsonWith(response),
);

export interface XrpcHandleResolverOptions {
	serviceUrl: string;
	fetch?: typeof fetch;
}

export class XrpcHandleResolver implements HandleResolver {
	readonly serviceUrl: string;
	#fetch: typeof fetch;

	constructor({ serviceUrl, fetch: fetchThis = fetch }: XrpcHandleResolverOptions) {
		this.serviceUrl = serviceUrl;
		this.#fetch = fetchThis;
	}

	async resolve(handle: Handle, options?: ResolveHandleOptions): Promise<AtprotoDid> {
		let json: v.Infer<typeof response>;

		try {
			const url = new URL(`/xrpc/com.atproto.identity.resolveHandle`, this.serviceUrl);
			url.searchParams.set('handle', handle);

			const response = await this.#fetch(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : 'default',
				headers: { accept: 'application/json' },
			});

			const handled = await fetchXrpcHandler(response);

			json = handled.json;
		} catch (cause) {
			if (cause instanceof FailedResponseError && cause.status === 400) {
				throw new err.DidNotFoundError(handle);
			}

			throw new err.FailedHandleResolutionError(handle, { cause });
		}

		return json.did;
	}
}
