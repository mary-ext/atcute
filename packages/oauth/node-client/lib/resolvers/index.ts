import type { ActorResolver, ResolvedActor } from '@atcute/identity-resolver';
import type { ActorIdentifier } from '@atcute/lexicons';
import type { AtprotoAuthorizationServerMetadata } from '@atcute/oauth-types';

import { OAuthResolverError } from '../errors.js';

import { AuthorizationServerMetadataResolver } from './authorization-server-metadata.js';
import { ProtectedResourceMetadataResolver } from './protected-resource-metadata.js';

export interface ResolveOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface ResolvedFromIdentity {
	identity: ResolvedActor;
	metadata: AtprotoAuthorizationServerMetadata;
}

export interface ResolvedFromService {
	identity?: undefined;
	metadata: AtprotoAuthorizationServerMetadata;
}

/**
 * resolves OAuth metadata for AT Protocol services.
 *
 * combines identity resolution with OAuth metadata discovery.
 */
export class OAuthResolver {
	constructor(
		readonly actorResolver: ActorResolver,
		readonly protectedResourceResolver: ProtectedResourceMetadataResolver,
		readonly authorizationServerResolver: AuthorizationServerMetadataResolver,
	) {}

	/**
	 * resolves OAuth metadata from a service URL (PDS or entryway).
	 *
	 * tries as PDS first (protected resource), falls back to entryway (AS directly).
	 *
	 * @param url PDS or entryway URL
	 * @param options resolution options
	 * @returns AS metadata
	 */
	async resolveFromService(url: string, options?: ResolveOptions): Promise<ResolvedFromService> {
		try {
			// try as PDS first (protected resource → AS)
			const metadata = await this.getResourceServerMetadata(url, options);
			return { metadata };
		} catch (err) {
			if (options?.signal?.aborted) {
				throw err;
			}

			// fall back to trying as entryway (AS directly)
			if (err instanceof OAuthResolverError) {
				try {
					const metadata = await this.authorizationServerResolver.resolve(url, options);
					return { metadata };
				} catch {
					// fallback failed, throw original error
				}
			}

			throw err;
		}
	}

	/**
	 * resolves OAuth metadata from an identity (handle or DID).
	 *
	 * @param input handle or DID
	 * @param options resolution options
	 * @returns resolved actor and AS metadata
	 */
	async resolveFromIdentity(input: ActorIdentifier, options?: ResolveOptions): Promise<ResolvedFromIdentity> {
		let identity: ResolvedActor;
		try {
			identity = await this.actorResolver.resolve(input, options);
		} catch (cause) {
			throw new OAuthResolverError(`failed to resolve identity: ${input}`, { cause });
		}

		options?.signal?.throwIfAborted();

		const metadata = await this.getResourceServerMetadata(identity.pds, options);

		return { identity, metadata };
	}

	/**
	 * resolves AS metadata via a protected resource (PDS).
	 *
	 * @param pdsUrl PDS URL
	 * @param options resolution options
	 * @returns AS metadata
	 */
	private async getResourceServerMetadata(
		pdsUrl: string | URL,
		options?: ResolveOptions,
	): Promise<AtprotoAuthorizationServerMetadata> {
		let rsMetadata;
		try {
			rsMetadata = await this.protectedResourceResolver.resolve(pdsUrl, options);
		} catch (cause) {
			throw new OAuthResolverError(`failed to resolve protected resource metadata: ${pdsUrl}`, { cause });
		}

		// atproto validation already ensures exactly one AS, but TypeScript doesn't know
		const issuer = rsMetadata.authorization_servers[0];

		options?.signal?.throwIfAborted();

		let asMetadata;
		try {
			asMetadata = await this.authorizationServerResolver.resolve(issuer, options);
		} catch (cause) {
			throw new OAuthResolverError(`failed to resolve AS metadata for issuer: ${issuer}`, { cause });
		}

		// validate that AS actually protects this resource (RFC 9728 section 4)
		if (asMetadata.protected_resources) {
			if (!asMetadata.protected_resources.includes(rsMetadata.resource)) {
				throw new OAuthResolverError(`PDS "${pdsUrl}" not listed in AS "${issuer}" protected_resources`);
			}
		}

		return asMetadata;
	}
}
