import * as v from 'valibot';

import { oauthIssuerIdentifierSchema } from './oauth-issuer-identifier.ts';
import { webUriSchema } from './uri.ts';

export const oauthBearerMethodSchema = v.picklist(['header', 'body', 'query']);

export type OAuthBearerMethod = v.InferOutput<typeof oauthBearerMethodSchema>;

/** @see {@link https://www.rfc-editor.org/rfc/rfc9728.html#section-3.2} */
export const oauthProtectedResourceMetadataSchema = v.looseObject({
	/**
	 * REQUIRED. the protected resource's resource identifier, which is a URL that uses the https scheme and has
	 * no query or fragment components.
	 */
	resource: webUriSchema,

	/**
	 * OPTIONAL. JSON array containing a list of OAuth authorization server issuer identifiers, as defined in
	 * RFC8414, for authorization servers that can be used with this protected resource.
	 */
	authorization_servers: v.optional(v.array(oauthIssuerIdentifierSchema)),

	/** OPTIONAL. URL of the protected resource's JWK Set document. */
	jwks_uri: v.optional(webUriSchema),

	/**
	 * RECOMMENDED. JSON array containing a list of the OAuth 2.0 scope values that are used in authorization
	 * requests to request access to this protected resource.
	 */
	scopes_supported: v.optional(v.array(v.string())),

	/**
	 * OPTIONAL. JSON array containing a list of the supported methods of sending an OAuth 2.0 Bearer Token to
	 * the protected resource.
	 */
	bearer_methods_supported: v.optional(v.array(oauthBearerMethodSchema)),

	/**
	 * OPTIONAL. JSON array containing a list of the JWS signing algorithms supported by the protected resource
	 * for signing resource responses.
	 */
	resource_signing_alg_values_supported: v.optional(v.array(v.string())),

	/**
	 * OPTIONAL. URL of a page containing human-readable information that developers might want or need to know
	 * when using the protected resource.
	 */
	resource_documentation: v.optional(webUriSchema),

	/**
	 * OPTIONAL. URL that the protected resource provides to read about the protected resource's requirements on
	 * how the client can use the data.
	 */
	resource_policy_uri: v.optional(webUriSchema),

	/**
	 * OPTIONAL. URL that the protected resource provides to read about the protected resource's terms of
	 * service.
	 */
	resource_tos_uri: v.optional(webUriSchema),
});

export const oauthProtectedResourceMetadataValidator = v.pipe(
	oauthProtectedResourceMetadataSchema,
	v.forward(
		v.check((data) => {
			const url = new URL(data.resource);
			return !url.search && !url.hash;
		}, `resource URL must not contain query parameters or a fragment`),
		['resource'],
	),
);

export type OAuthProtectedResourceMetadata = v.InferOutput<typeof oauthProtectedResourceMetadataSchema>;
