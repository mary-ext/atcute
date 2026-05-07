import {
	atprotoAuthorizationServerMetadataValidator,
	oauthIssuerIdentifierSchema,
	type AtprotoAuthorizationServerMetadata,
} from '@atcute/oauth-types';
import { parseResponseAsJson, pipe, validateJsonWith } from '@atcute/util-fetch';

import * as v from 'valibot';

import { AS_METADATA_MAX_SIZE, JSON_MIME } from '../constants.ts';
import { OAuthResolverError } from '../errors.ts';
import { CachedGetter, type GetCachedOptions } from '../utils/cached-getter.ts';
import type { Store } from '../utils/store.ts';

/** authorization server metadata cache, keyed by issuer */
export type AuthorizationServerMetadataCache = Store<string, AtprotoAuthorizationServerMetadata>;

/** hoisted pipeline for parsing and validating AS metadata */
const processResponse = pipe(
	parseResponseAsJson(JSON_MIME, AS_METADATA_MAX_SIZE),
	validateJsonWith(atprotoAuthorizationServerMetadataValidator),
);

export interface AuthorizationServerMetadataResolverOptions {
	/** metadata cache, keyed by issuer */
	cache: AuthorizationServerMetadataCache;
	/** allow http:// loopback issuers (for development only) */
	allowHttp?: boolean;
	/** custom fetch implementation */
	fetch?: typeof globalThis.fetch;
}

/**
 * resolves OAuth authorization server metadata.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc8414}
 */
export class AuthorizationServerMetadataResolver extends CachedGetter<
	string,
	AtprotoAuthorizationServerMetadata
> {
	private readonly allowHttp: boolean;
	private readonly fetch: typeof globalThis.fetch;

	constructor(options: AuthorizationServerMetadataResolverOptions) {
		super((issuer, opts) => this.fetchMetadata(issuer, opts), options.cache);
		this.allowHttp = options.allowHttp ?? false;
		this.fetch = options.fetch ?? globalThis.fetch;
	}

	/**
	 * resolves metadata for an authorization server.
	 *
	 * @param issuer authorization server issuer URL
	 * @param options fetch options
	 * @returns validated authorization server metadata
	 */
	async resolve(input: string, options?: GetCachedOptions): Promise<AtprotoAuthorizationServerMetadata> {
		// validate issuer format (allows https or loopback http only)
		const issuer = v.parse(oauthIssuerIdentifierSchema, input);

		// loopback http only allowed in development
		if (issuer.startsWith('http:') && !this.allowHttp) {
			throw new OAuthResolverError(`http issuer not allowed (set allowHttp for development)`);
		}

		return this.get(issuer, options);
	}

	private async fetchMetadata(
		issuer: string,
		options: { signal?: AbortSignal },
	): Promise<AtprotoAuthorizationServerMetadata> {
		const metadataUrl = new URL('/.well-known/oauth-authorization-server', issuer);
		const response = await (0, this.fetch)(metadataUrl, {
			headers: { accept: 'application/json' },
			signal: options.signal,
			redirect: 'manual',
		});

		if (response.status !== 200) {
			throw new OAuthResolverError(`unexpected status ${response.status} from ${metadataUrl}`);
		}

		const { json: metadata } = await processResponse(response);

		// validate issuer matches (MIX-UP attack prevention)
		if (metadata.issuer !== issuer) {
			throw new OAuthResolverError(`issuer mismatch: expected ${issuer}, got ${metadata.issuer}`);
		}

		return metadata;
	}
}
