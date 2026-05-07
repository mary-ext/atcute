import * as v from 'valibot';

import {
	oauthAuthorizationServerMetadataValidator,
	type OAuthAuthorizationServerMetadata,
} from './oauth-authorization-server-metadata.ts';

export type AtprotoAuthorizationServerMetadata = OAuthAuthorizationServerMetadata & {
	pushed_authorization_request_endpoint: string;
};

/**
 * AT Protocol authorization server metadata with required fields and assertions.
 *
 * @see {@link https://atproto.com/specs/oauth}
 */
export const atprotoAuthorizationServerMetadataValidator: v.GenericSchema<
	unknown,
	AtprotoAuthorizationServerMetadata
> = v.pipe(
	oauthAuthorizationServerMetadataValidator,
	v.forward(
		v.check(
			(data) => data.client_id_metadata_document_supported === true,
			`atproto requires client_id_metadata_document_supported to be true`,
		),
		['client_id_metadata_document_supported'],
	),
	v.forward(
		v.check(
			(data) => !!data.pushed_authorization_request_endpoint,
			`atproto requires pushed_authorization_request_endpoint to be true`,
		),
		['pushed_authorization_request_endpoint'],
	),
) as unknown as v.GenericSchema<unknown, AtprotoAuthorizationServerMetadata>;
