import type { DidDocumentResolver, HandleResolver } from '@atcute/identity-resolver';

import { createOAuthDatabase, type OAuthDatabase } from './store/db.js';

export let CLIENT_ID: string;
export let REDIRECT_URI: string;

export let database: OAuthDatabase;

export let handleResolver: HandleResolver;
export let didDocumentResolver: DidDocumentResolver;

export interface ConfigureOAuthOptions {
	/** used to resolve handles into DIDs */
	handleResolver: HandleResolver;
	/** used to resolve DIDs into DID documents */
	didDocumentResolver: DidDocumentResolver;

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
	({ handleResolver, didDocumentResolver } = options);
	({ client_id: CLIENT_ID, redirect_uri: REDIRECT_URI } = options.metadata);

	database = createOAuthDatabase({ name: options.storageName ?? 'atcute-oauth' });
};
