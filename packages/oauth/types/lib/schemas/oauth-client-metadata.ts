import * as v from 'valibot';

import { jwksPubSchema } from './jwks.ts';
import { oauthClientIdSchema } from './oauth-client-id.ts';
import { oauthEndpointAuthMethodSchema } from './oauth-endpoint-auth-method.ts';
import { oauthGrantTypeSchema } from './oauth-grant-type.ts';
import { oauthRedirectUriSchema } from './oauth-redirect-uri.ts';
import { oauthResponseTypeSchema } from './oauth-response-type.ts';
import { oauthScopeSchema } from './oauth-scope.ts';
import { webUriSchema } from './uri.ts';

const oauthApplicationTypeSchema = v.union([v.literal('web'), v.literal('native')]);

const oauthSubjectTypeSchema = v.union([v.literal('public'), v.literal('pairwise')]);

// simple email validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * base OAuth client metadata schema.
 *
 * @see {@link https://openid.net/specs/openid-connect-registration-1_0.html}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7591}
 */
export const oauthClientMetadataSchema = v.looseObject({
	// https://www.rfc-editor.org/rfc/rfc7591.html#section-2
	redirect_uris: v.pipe(
		v.array(oauthRedirectUriSchema),
		v.check((arr) => arr.length > 0, `must have at least one redirect URI`),
	),
	response_types: v.optional(v.array(oauthResponseTypeSchema)),
	// > If omitted, the default is that the client will use only the "code"
	// > response type.
	grant_types: v.optional(v.array(oauthGrantTypeSchema)),
	// > If omitted, the default behavior is that the client will use only the
	// > "authorization_code" Grant Type.
	scope: v.optional(oauthScopeSchema),
	// https://www.rfc-editor.org/rfc/rfc7591.html#section-2
	token_endpoint_auth_method: v.optional(oauthEndpointAuthMethodSchema),
	// > If unspecified or omitted, the default is "client_secret_basic" [...].
	token_endpoint_auth_signing_alg: v.optional(v.string()),
	userinfo_signed_response_alg: v.optional(v.string()),
	userinfo_encrypted_response_alg: v.optional(v.string()),
	jwks_uri: v.optional(webUriSchema),
	jwks: v.optional(jwksPubSchema),
	application_type: v.optional(oauthApplicationTypeSchema),
	subject_type: v.optional(oauthSubjectTypeSchema),
	request_object_signing_alg: v.optional(v.string()),
	id_token_signed_response_alg: v.optional(v.string()),
	authorization_signed_response_alg: v.optional(v.string()),
	authorization_encrypted_response_enc: v.optional(v.literal('A128CBC-HS256')),
	authorization_encrypted_response_alg: v.optional(v.string()),
	client_id: v.optional(oauthClientIdSchema),
	client_name: v.optional(v.string()),
	client_uri: v.optional(webUriSchema),
	policy_uri: v.optional(webUriSchema),
	tos_uri: v.optional(webUriSchema),
	logo_uri: v.optional(webUriSchema),

	/**
	 * default Maximum Authentication Age. specifies that the End-User MUST be
	 * actively authenticated if the End-User was authenticated longer ago than
	 * the specified number of seconds. the max_age request parameter overrides
	 * this default value. if omitted, no default Maximum Authentication Age is
	 * specified.
	 */
	default_max_age: v.optional(v.number()),
	require_auth_time: v.optional(v.boolean()),
	contacts: v.optional(
		v.array(
			v.pipe(
				v.string(),
				v.check((s) => EMAIL_RE.test(s), `must be a valid email`),
			),
		),
	),
	tls_client_certificate_bound_access_tokens: v.optional(v.boolean()),

	// https://datatracker.ietf.org/doc/html/rfc9449#section-5.2
	dpop_bound_access_tokens: v.optional(v.boolean()),

	// https://datatracker.ietf.org/doc/html/rfc9396#section-14.5
	authorization_details_types: v.optional(v.array(v.string())),
});

export type OAuthClientMetadata = v.InferOutput<typeof oauthClientMetadataSchema>;
