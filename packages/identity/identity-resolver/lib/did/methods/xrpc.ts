import { defs, type DidDocument } from '@atcute/identity';
import type { Did } from '@atcute/lexicons/syntax';
import {
	FailedResponseError,
	isResponseOk,
	parseResponseAsJson,
	pipe,
	validateJsonWith,
} from '@atcute/util-fetch';

import * as v from 'valibot';

import * as err from '../../errors.ts';
import type { DidDocumentResolver, ResolveDidDocumentOptions } from '../../types.ts';

const fetchXrpcHandler = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/json$/, 20 * 1024 + 16),
	validateJsonWith(v.looseObject({ didDoc: defs.didDocument })),
);

export interface XrpcDidDocumentResolverOptions {
	serviceUrl: string;
	fetch?: typeof fetch;
}

export class XrpcDidDocumentResolver implements DidDocumentResolver<string> {
	readonly serviceUrl: string;
	#fetch: typeof fetch;

	constructor({ serviceUrl, fetch: fetchThis = fetch }: XrpcDidDocumentResolverOptions) {
		this.serviceUrl = serviceUrl;
		this.#fetch = fetchThis;
	}

	async resolve(did: Did, options?: ResolveDidDocumentOptions): Promise<DidDocument> {
		let json: DidDocument;

		try {
			const url = new URL(`/xrpc/com.atproto.identity.resolveDid`, this.serviceUrl);
			url.searchParams.set('did', did);

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				headers: { accept: 'application/json' },
			});

			const handled = await fetchXrpcHandler(response);

			json = handled.json.didDoc;
		} catch (cause) {
			if (cause instanceof FailedResponseError && cause.status === 404) {
				throw new err.DocumentNotFoundError(did);
			}

			throw new err.FailedDocumentResolutionError(did, { cause });
		}

		return json;
	}
}
