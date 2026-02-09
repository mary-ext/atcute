import * as v from '@badrap/valita';

import { jwksPubSchema } from './jwks.ts';
import { oauthClientIdSchema } from './oauth-client-id.ts';
import { oauthEndpointAuthMethodSchema } from './oauth-endpoint-auth-method.ts';
import { oauthGrantTypeSchema } from './oauth-grant-type.ts';
import { oauthRedirectUriSchema } from './oauth-redirect-uri.ts';
import { oauthResponseTypeSchema } from './oauth-response-type.ts';
import { oauthScopeSchema } from './oauth-scope.ts';
import { webUriSchema } from './uri.ts';

const oauthApplicationTypeSchema = v.union(v.literal('web'), v.literal('native'));

const oauthSubjectTypeSchema = v.union(v.literal('public'), v.literal('pairwise'));

// simple email validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * base OAuth client metadata schema.
 *
 * @see {@link https://openid.net/specs/openid-connect-registration-1_0.html}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7591}
 */
export const oauthClientMetadataSchema = v.object({
	// https://www.rfc-editor.org/rfc/rfc7591.html#section-2
	redirect_uris: v
		.array(oauthRedirectUriSchema)
		.assert((arr) => arr.length > 0, `must have at least one redirect URI`),
	response_types: v.array(oauthResponseTypeSchema).optional(),
	// > If omitted, the default is that the client will use only the "code"
	// > response type.
	// .optional((): OAuthResponseType[] => ['code'])
	grant_types: v.array(oauthGrantTypeSchema).optional(),
	// > If omitted, the default behavior is that the client will use only the
	// > "authorization_code" Grant Type.
	// .optional((): OAuthGrantType[] => ['authorization_code']),
	scope: oauthScopeSchema.optional(),
	// https://www.rfc-editor.org/rfc/rfc7591.html#section-2
	token_endpoint_auth_method: oauthEndpointAuthMethodSchema.optional(),
	// > If unspecified or omitted, the default is "client_secret_basic" [...].
	// .optional((): OAuthEndpointAuthMethod => 'client_secret_basic'),
	token_endpoint_auth_signing_alg: v.string().optional(),
	userinfo_signed_response_alg: v.string().optional(),
	userinfo_encrypted_response_alg: v.string().optional(),
	jwks_uri: webUriSchema.optional(),
	jwks: jwksPubSchema.optional(),
	application_type: oauthApplicationTypeSchema.optional(),
	// .optional((): OAuthApplicationType => 'web'),
	subject_type: oauthSubjectTypeSchema.optional(),
	// .optional((): OAuthSubjectType => 'public'),
	request_object_signing_alg: v.string().optional(),
	id_token_signed_response_alg: v.string().optional(),
	authorization_signed_response_alg: v.string().optional(),
	authorization_encrypted_response_enc: v.literal('A128CBC-HS256').optional(),
	authorization_encrypted_response_alg: v.string().optional(),
	client_id: oauthClientIdSchema.optional(),
	client_name: v.string().optional(),
	client_uri: webUriSchema.optional(),
	policy_uri: webUriSchema.optional(),
	tos_uri: webUriSchema.optional(),
	logo_uri: webUriSchema.optional(),

	/**
	 * default Maximum Authentication Age. specifies that the End-User MUST be
	 * actively authenticated if the End-User was authenticated longer ago than
	 * the specified number of seconds. the max_age request parameter overrides
	 * this default value. if omitted, no default Maximum Authentication Age is
	 * specified.
	 */
	default_max_age: v.number().optional(),
	require_auth_time: v.boolean().optional(),
	contacts: v.array(v.string().assert((s) => EMAIL_RE.test(s), `must be a valid email`)).optional(),
	tls_client_certificate_bound_access_tokens: v.boolean().optional(),

	// https://datatracker.ietf.org/doc/html/rfc9449#section-5.2
	dpop_bound_access_tokens: v.boolean().optional(),

	// https://datatracker.ietf.org/doc/html/rfc9396#section-14.5
	authorization_details_types: v.array(v.string()).optional(),
});

export type OAuthClientMetadata = v.Infer<typeof oauthClientMetadataSchema>;
