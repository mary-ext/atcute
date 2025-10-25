import type { IdentityResolver } from './types/identity.js';

import { createOAuthDatabase, type OAuthDatabase } from './store/db.js';

export let CLIENT_ID: string;
export let REDIRECT_URI: string;

export let database: OAuthDatabase;

export let identityResolver: IdentityResolver;

export interface ConfigureOAuthOptions {
	/** resolves actor identifiers into identity metadata */
	identityResolver: IdentityResolver;

	/**
	 * client metadata, necessary to drive the whole request
	 */
	metadata: {
		client_id: string;
		redirect_uri: string;
	};

	/**
	 * name that will be used as prefix for storage keys needed to persist authentication.
	 * @default "atcute-oauth"
	 */
	storageName?: string;
}

export const configureOAuth = (options: ConfigureOAuthOptions) => {
	({ identityResolver } = options);
	({ client_id: CLIENT_ID, redirect_uri: REDIRECT_URI } = options.metadata);

	database = createOAuthDatabase({ name: options.storageName ?? 'atcute-oauth' });
};
