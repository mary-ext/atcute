import * as v from '@badrap/valita';

import { oauthAuthorizationServerMetadataValidator } from './oauth-authorization-server-metadata.ts';

/**
 * AT Protocol authorization server metadata with required fields and assertions.
 *
 * @see {@link https://atproto.com/specs/oauth}
 */
export const atprotoAuthorizationServerMetadataValidator = oauthAuthorizationServerMetadataValidator.chain(
	(data) => {
		// atproto requires client_id_metadata_document support
		if (data.client_id_metadata_document_supported !== true) {
			return v.err({
				message: `atproto requires client_id_metadata_document_supported to be true`,
				path: ['client_id_metadata_document_supported'],
			});
		}

		// atproto requires PAR
		if (!data.pushed_authorization_request_endpoint) {
			return v.err({
				message: `atproto requires pushed_authorization_request_endpoint to be true`,
				path: ['pushed_authorization_request_endpoint'],
			});
		}

		return v.ok(data as typeof data & { pushed_authorization_request_endpoint: string });
	},
);

export type AtprotoAuthorizationServerMetadata = v.Infer<typeof atprotoAuthorizationServerMetadataValidator>;
