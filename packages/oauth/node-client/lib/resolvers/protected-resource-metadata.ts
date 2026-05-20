import {
	type AtprotoProtectedResourceMetadata,
	atprotoProtectedResourceMetadataValidator,
} from '@atcute/oauth-types';
import { parseResponseAsJson, pipe, validateJsonWith } from '@atcute/util-fetch';

import { JSON_MIME, PR_METADATA_MAX_SIZE } from '../constants.ts';
import { OAuthResolverError } from '../errors.ts';
import { CachedGetter, type GetCachedOptions } from '../utils/cached-getter.ts';
import type { Store } from '../utils/store.ts';

/** protected resource metadata cache, keyed by resource origin */
export type ProtectedResourceMetadataCache = Store<string, AtprotoProtectedResourceMetadata>;

/** hoisted pipeline for parsing and validating protected resource metadata */
const processResponse = pipe(
	parseResponseAsJson(JSON_MIME, PR_METADATA_MAX_SIZE),
	validateJsonWith(atprotoProtectedResourceMetadataValidator),
);

export interface ProtectedResourceMetadataResolverOptions {
	/** metadata cache, keyed by resource origin */
	cache: ProtectedResourceMetadataCache;
	/** allow http:// resources (for development only) */
	allowHttp?: boolean;
	/** custom fetch implementation */
	fetch?: typeof globalThis.fetch;
}

/**
 * resolves OAuth protected resource metadata.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9728.html}
 */
export class ProtectedResourceMetadataResolver extends CachedGetter<
	string,
	AtprotoProtectedResourceMetadata
> {
	private readonly allowHttp: boolean;
	private readonly fetch: typeof globalThis.fetch;

	constructor(options: ProtectedResourceMetadataResolverOptions) {
		super((origin, opts) => this.fetchMetadata(origin, opts), options.cache);
		this.allowHttp = options.allowHttp ?? false;
		this.fetch = options.fetch ?? globalThis.fetch;
	}

	/**
	 * resolves metadata for a protected resource (PDS).
	 *
	 * @param resource protected resource URL or origin
	 * @param options fetch options
	 * @returns validated protected resource metadata
	 */
	async resolve(
		resource: string | URL,
		options?: GetCachedOptions,
	): Promise<AtprotoProtectedResourceMetadata> {
		const url = new URL(resource);

		if (url.protocol !== 'https:' && url.protocol !== 'http:') {
			throw new OAuthResolverError(`invalid resource protocol: ${url.protocol}`);
		}
		if (url.protocol === 'http:' && !this.allowHttp) {
			throw new OAuthResolverError(`http resource not allowed (set allowHttp for development)`);
		}

		return this.get(url.origin, options);
	}

	private async fetchMetadata(
		origin: string,
		options: { signal?: AbortSignal },
	): Promise<AtprotoProtectedResourceMetadata> {
		const metadataUrl = new URL('/.well-known/oauth-protected-resource', origin);
		const response = await (0, this.fetch)(metadataUrl, {
			headers: { accept: 'application/json' },
			signal: options.signal,
			redirect: 'manual',
		});

		if (response.status !== 200) {
			throw new OAuthResolverError(`unexpected status ${response.status} from ${metadataUrl}`);
		}

		const { json: metadata } = await processResponse(response);

		// validate resource matches
		if (metadata.resource !== origin) {
			throw new OAuthResolverError(`resource mismatch: expected ${origin}, got ${metadata.resource}`);
		}

		return metadata;
	}
}
