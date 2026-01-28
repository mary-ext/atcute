import type { DpopPrivateJwk } from '@atcute/oauth-crypto';
import type { Keyset } from '@atcute/oauth-keyset';
import type { AtprotoAuthorizationServerMetadata, OAuthClientMetadata } from '@atcute/oauth-types';

import { type ClientAuthMethod, negotiateClientAuth } from './oauth-client-auth.js';
import { OAuthServerAgent } from './oauth-server-agent.js';
import { OAuthResolver } from './resolvers/index.js';
import type { Store } from './utils/store.js';

export interface OAuthServerFactoryOptions {
	/** client metadata */
	clientMetadata: OAuthClientMetadata;
	/** OAuth resolver for metadata discovery */
	resolver: OAuthResolver;
	/** client's private keyset */
	keyset: Keyset;
	/** DPoP nonce cache, keyed by origin */
	dpopNonces: Store<string, string>;
	/** custom fetch implementation */
	fetch?: typeof globalThis.fetch;
}

/**
 * factory for creating OAuthServerAgent instances.
 *
 * used to recreate agents from stored session data for token refresh.
 */
export class OAuthServerFactory {
	readonly clientMetadata: OAuthClientMetadata;
	readonly resolver: OAuthResolver;
	readonly keyset: Keyset;
	readonly dpopNonces: Store<string, string>;
	readonly fetch?: typeof globalThis.fetch;

	constructor(options: OAuthServerFactoryOptions) {
		this.clientMetadata = options.clientMetadata;
		this.resolver = options.resolver;
		this.keyset = options.keyset;
		this.dpopNonces = options.dpopNonces;
		this.fetch = options.fetch;
	}

	/**
	 * creates an OAuthServerAgent from an issuer and stored session data.
	 *
	 * @param issuer authorization server issuer
	 * @param authMethod client authentication method from stored session
	 * @param dpopKey DPoP key from stored session
	 * @param options fetch options
	 * @returns configured OAuthServerAgent
	 */
	async fromIssuer(
		issuer: string,
		authMethod: ClientAuthMethod,
		dpopKey: DpopPrivateJwk,
		options?: { signal?: AbortSignal; noCache?: boolean },
	): Promise<OAuthServerAgent> {
		const serverMetadata = await this.resolver.authorizationServerResolver.resolve(issuer, options);
		return this.fromMetadata(serverMetadata, authMethod, dpopKey);
	}

	/**
	 * creates an OAuthServerAgent from resolved metadata.
	 *
	 * @param serverMetadata authorization server metadata
	 * @param authMethod client authentication method
	 * @param dpopKey DPoP private key
	 * @returns configured OAuthServerAgent
	 */
	fromMetadata(
		serverMetadata: AtprotoAuthorizationServerMetadata,
		authMethod: ClientAuthMethod,
		dpopKey: DpopPrivateJwk,
	): OAuthServerAgent {
		return new OAuthServerAgent({
			authMethod,
			dpopKey,
			serverMetadata,
			clientMetadata: this.clientMetadata,
			dpopNonces: this.dpopNonces,
			oauthResolver: this.resolver,
			keyset: this.keyset,
			fetch: this.fetch,
		});
	}

	/**
	 * creates an OAuthServerAgent for a new authorization flow.
	 *
	 * negotiates the auth method with the server.
	 *
	 * @param serverMetadata authorization server metadata
	 * @param dpopKey DPoP private key
	 * @returns configured OAuthServerAgent
	 */
	fromMetadataNewSession(
		serverMetadata: AtprotoAuthorizationServerMetadata,
		dpopKey: DpopPrivateJwk,
	): OAuthServerAgent {
		const authMethod = negotiateClientAuth(serverMetadata, this.keyset);
		return this.fromMetadata(serverMetadata, authMethod, dpopKey);
	}
}
