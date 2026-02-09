import type { ActorResolver } from '@atcute/identity-resolver';

import { createOAuthDatabase, type OAuthDatabase } from './store/db.ts';
import type { ClientAssertionFetcher } from './types/client-assertion.ts';

export let CLIENT_ID: string;
export let REDIRECT_URI: string;

export let fetchClientAssertion: ClientAssertionFetcher | undefined;

export let database: OAuthDatabase;

export let identityResolver: ActorResolver;

export interface ConfigureOAuthOptions {
	/**
	 * client metadata, necessary to drive the whole request
	 */
	metadata: {
		client_id: string;
		redirect_uri: string;
	};

	/** resolves actor identifiers into identity metadata */
	identityResolver: ActorResolver;

	/**
	 * optional function to fetch DPoP-bound client assertions from your backend.
	 */
	fetchClientAssertion?: ClientAssertionFetcher;

	/**
	 * name that will be used as prefix for storage keys needed to persist authentication.
	 * @default "atcute-oauth"
	 */
	storageName?: string;
}

export const configureOAuth = (options: ConfigureOAuthOptions) => {
	({ identityResolver, fetchClientAssertion } = options);
	({ client_id: CLIENT_ID, redirect_uri: REDIRECT_URI } = options.metadata);

	database = createOAuthDatabase({ name: options.storageName ?? 'atcute-oauth' });
};
