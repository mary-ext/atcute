import * as v from 'valibot';

import { oauthCodeChallengeMethodSchema } from './oauth-code-challenge-method.ts';
import { oauthIssuerIdentifierSchema } from './oauth-issuer-identifier.ts';
import { oauthPromptSchema } from './oauth-prompt.ts';
import { webUriSchema } from './uri.ts';

/**
 * @see {@link https://datatracker.ietf.org/doc/html/rfc8414}
 */
export const oauthAuthorizationServerMetadataSchema = v.looseObject({
	issuer: oauthIssuerIdentifierSchema,

	claims_supported: v.optional(v.array(v.string())),
	claims_locales_supported: v.optional(v.array(v.string())),
	claims_parameter_supported: v.optional(v.boolean()),
	request_parameter_supported: v.optional(v.boolean()),
	request_uri_parameter_supported: v.optional(v.boolean()),
	require_request_uri_registration: v.optional(v.boolean()),
	scopes_supported: v.optional(v.array(v.string())),
	subject_types_supported: v.optional(v.array(v.string())),
	response_types_supported: v.optional(v.array(v.string())),
	response_modes_supported: v.optional(v.array(v.string())),
	grant_types_supported: v.optional(v.array(v.string())),
	code_challenge_methods_supported: v.optional(v.array(oauthCodeChallengeMethodSchema)),
	ui_locales_supported: v.optional(v.array(v.string())),
	id_token_signing_alg_values_supported: v.optional(v.array(v.string())),
	display_values_supported: v.optional(v.array(v.string())),
	prompt_values_supported: v.optional(v.array(oauthPromptSchema)),
	request_object_signing_alg_values_supported: v.optional(v.array(v.string())),
	authorization_response_iss_parameter_supported: v.optional(v.boolean()),
	authorization_details_types_supported: v.optional(v.array(v.string())),
	request_object_encryption_alg_values_supported: v.optional(v.array(v.string())),
	request_object_encryption_enc_values_supported: v.optional(v.array(v.string())),

	jwks_uri: v.optional(webUriSchema),

	authorization_endpoint: webUriSchema,

	token_endpoint: webUriSchema,
	// https://www.rfc-editor.org/rfc/rfc8414.html#section-2
	token_endpoint_auth_methods_supported: v.optional(v.array(v.string())),
	token_endpoint_auth_signing_alg_values_supported: v.optional(v.array(v.string())),

	revocation_endpoint: v.optional(webUriSchema),
	revocation_endpoint_auth_methods_supported: v.optional(v.array(v.string())),
	revocation_endpoint_auth_signing_alg_values_supported: v.optional(v.array(v.string())),

	introspection_endpoint: v.optional(webUriSchema),
	introspection_endpoint_auth_methods_supported: v.optional(v.array(v.string())),
	introspection_endpoint_auth_signing_alg_values_supported: v.optional(v.array(v.string())),

	pushed_authorization_request_endpoint: v.optional(webUriSchema),
	pushed_authorization_request_endpoint_auth_methods_supported: v.optional(v.array(v.string())),
	pushed_authorization_request_endpoint_auth_signing_alg_values_supported: v.optional(v.array(v.string())),
	require_pushed_authorization_requests: v.optional(v.boolean()),

	userinfo_endpoint: v.optional(webUriSchema),
	end_session_endpoint: v.optional(webUriSchema),
	registration_endpoint: v.optional(webUriSchema),

	// https://datatracker.ietf.org/doc/html/rfc9449#section-5.1
	dpop_signing_alg_values_supported: v.optional(v.array(v.string())),

	// https://www.rfc-editor.org/rfc/rfc9728.html#section-4
	protected_resources: v.optional(v.array(webUriSchema)),

	// https://www.ietf.org/archive/id/draft-ietf-oauth-client-id-metadata-document-00.html
	client_id_metadata_document_supported: v.optional(v.boolean()),
});

export type OAuthAuthorizationServerMetadata = v.InferOutput<typeof oauthAuthorizationServerMetadataSchema>;

export const oauthAuthorizationServerMetadataValidator = v.pipe(
	oauthAuthorizationServerMetadataSchema,
	v.forward(
		v.check(
			(data) => !data.require_pushed_authorization_requests || !!data.pushed_authorization_request_endpoint,
			`"pushed_authorization_request_endpoint" required when "require_pushed_authorization_requests" is true`,
		),
		['pushed_authorization_request_endpoint'],
	),
	v.forward(
		v.check(
			(data) => !data.response_types_supported || data.response_types_supported.includes('code'),
			`response type "code" is required`,
		),
		['response_types_supported'],
	),
	v.forward(
		v.check(
			(data) => !data.token_endpoint_auth_signing_alg_values_supported?.includes('none'),
			// https://openid.net/specs/openid-connect-discovery-1_0.html#rfc.section.3
			// > The value `none` MUST NOT be used.
			`client authentication method "none" is not allowed`,
		),
		['token_endpoint_auth_signing_alg_values_supported'],
	),
);
