import * as v from '@badrap/valita';

import { oauthProtectedResourceMetadataValidator } from './oauth-protected-resource-metadata.js';

/**
 * AT Protocol protected resource metadata with required fields.
 *
 * @see {@link https://atproto.com/specs/oauth}
 */
export const atprotoProtectedResourceMetadataValidator = oauthProtectedResourceMetadataValidator.chain(
	(data) => {
		// atproto requires exactly one authorization server
		if (data.authorization_servers?.length !== 1) {
			return v.err({
				message: `atproto requires exactly one authorization server`,
				path: ['authorization_servers'],
			});
		}

		return v.ok(data as typeof data & { authorization_servers: [string] });
	},
);

export type AtprotoProtectedResourceMetadata = v.Infer<typeof atprotoProtectedResourceMetadataValidator>;
