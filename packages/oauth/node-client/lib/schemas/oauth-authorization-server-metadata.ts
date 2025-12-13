import * as v from '@badrap/valita';

import { oauthCodeChallengeMethodSchema } from './oauth-code-challenge-method.js';
import { oauthIssuerIdentifierSchema } from './oauth-issuer-identifier.js';
import { webUriSchema } from './uri.js';

/**
 * @see {@link https://datatracker.ietf.org/doc/html/rfc8414}
 */
export const oauthAuthorizationServerMetadataSchema = v.object({
	issuer: oauthIssuerIdentifierSchema,

	claims_supported: v.array(v.string()).optional(),
	claims_locales_supported: v.array(v.string()).optional(),
	claims_parameter_supported: v.boolean().optional(),
	request_parameter_supported: v.boolean().optional(),
	request_uri_parameter_supported: v.boolean().optional(),
	require_request_uri_registration: v.boolean().optional(),
	scopes_supported: v.array(v.string()).optional(),
	subject_types_supported: v.array(v.string()).optional(),
	response_types_supported: v.array(v.string()).optional(),
	response_modes_supported: v.array(v.string()).optional(),
	grant_types_supported: v.array(v.string()).optional(),
	code_challenge_methods_supported: v.array(oauthCodeChallengeMethodSchema).optional(),
	ui_locales_supported: v.array(v.string()).optional(),
	id_token_signing_alg_values_supported: v.array(v.string()).optional(),
	display_values_supported: v.array(v.string()).optional(),
	request_object_signing_alg_values_supported: v.array(v.string()).optional(),
	authorization_response_iss_parameter_supported: v.boolean().optional(),
	authorization_details_types_supported: v.array(v.string()).optional(),
	request_object_encryption_alg_values_supported: v.array(v.string()).optional(),
	request_object_encryption_enc_values_supported: v.array(v.string()).optional(),

	jwks_uri: webUriSchema.optional(),

	authorization_endpoint: webUriSchema,

	token_endpoint: webUriSchema,
	// https://www.rfc-editor.org/rfc/rfc8414.html#section-2
	token_endpoint_auth_methods_supported: v.array(v.string()).optional(),
	token_endpoint_auth_signing_alg_values_supported: v.array(v.string()).optional(),

	revocation_endpoint: webUriSchema.optional(),
	revocation_endpoint_auth_methods_supported: v.array(v.string()).optional(),
	revocation_endpoint_auth_signing_alg_values_supported: v.array(v.string()).optional(),

	introspection_endpoint: webUriSchema.optional(),
	introspection_endpoint_auth_methods_supported: v.array(v.string()).optional(),
	introspection_endpoint_auth_signing_alg_values_supported: v.array(v.string()).optional(),

	pushed_authorization_request_endpoint: webUriSchema.optional(),
	pushed_authorization_request_endpoint_auth_methods_supported: v.array(v.string()).optional(),
	pushed_authorization_request_endpoint_auth_signing_alg_values_supported: v.array(v.string()).optional(),
	require_pushed_authorization_requests: v.boolean().optional(),

	userinfo_endpoint: webUriSchema.optional(),
	end_session_endpoint: webUriSchema.optional(),
	registration_endpoint: webUriSchema.optional(),

	// https://datatracker.ietf.org/doc/html/rfc9449#section-5.1
	dpop_signing_alg_values_supported: v.array(v.string()).optional(),

	// https://www.rfc-editor.org/rfc/rfc9728.html#section-4
	protected_resources: v.array(webUriSchema).optional(),

	// https://www.ietf.org/archive/id/draft-ietf-oauth-client-id-metadata-document-00.html
	client_id_metadata_document_supported: v.boolean().optional(),
});

export type OAuthAuthorizationServerMetadata = v.Infer<typeof oauthAuthorizationServerMetadataSchema>;

export const oauthAuthorizationServerMetadataValidator = oauthAuthorizationServerMetadataSchema.chain(
	(data) => {
		if (data.require_pushed_authorization_requests && !data.pushed_authorization_request_endpoint) {
			return v.err({
				message: `"pushed_authorization_request_endpoint" required when "require_pushed_authorization_requests" is true`,
				path: ['pushed_authorization_request_endpoint'],
			});
		}

		if (data.response_types_supported && !data.response_types_supported.includes('code')) {
			return v.err({
				message: `response type "code" is required`,
				path: ['response_types_supported'],
			});
		}

		if (data.token_endpoint_auth_signing_alg_values_supported?.includes('none')) {
			// https://openid.net/specs/openid-connect-discovery-1_0.html#rfc.section.3
			// > The value `none` MUST NOT be used.
			return v.err({
				message: `client authentication method "none" is not allowed`,
				path: ['token_endpoint_auth_signing_alg_values_supported'],
			});
		}

		return v.ok(data);
	},
);
