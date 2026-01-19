import * as v from '@badrap/valita';

import { oauthIssuerIdentifierSchema } from './oauth-issuer-identifier.js';
import { webUriSchema } from './uri.js';

export const oauthBearerMethodSchema = v.union(v.literal('header'), v.literal('body'), v.literal('query'));

export type OAuthBearerMethod = v.Infer<typeof oauthBearerMethodSchema>;

/**
 * @see {@link https://www.rfc-editor.org/rfc/rfc9728.html#section-3.2}
 */
export const oauthProtectedResourceMetadataSchema = v.object({
	/**
	 * REQUIRED. the protected resource's resource identifier, which is a URL that
	 * uses the https scheme and has no query or fragment components.
	 */
	resource: webUriSchema,

	/**
	 * OPTIONAL. JSON array containing a list of OAuth authorization server issuer
	 * identifiers, as defined in RFC8414, for authorization servers that can be
	 * used with this protected resource.
	 */
	authorization_servers: v.array(oauthIssuerIdentifierSchema).optional(),

	/**
	 * OPTIONAL. URL of the protected resource's JWK Set document.
	 */
	jwks_uri: webUriSchema.optional(),

	/**
	 * RECOMMENDED. JSON array containing a list of the OAuth 2.0 scope values that
	 * are used in authorization requests to request access to this protected resource.
	 */
	scopes_supported: v.array(v.string()).optional(),

	/**
	 * OPTIONAL. JSON array containing a list of the supported methods of sending
	 * an OAuth 2.0 Bearer Token to the protected resource.
	 */
	bearer_methods_supported: v.array(oauthBearerMethodSchema).optional(),

	/**
	 * OPTIONAL. JSON array containing a list of the JWS signing algorithms
	 * supported by the protected resource for signing resource responses.
	 */
	resource_signing_alg_values_supported: v.array(v.string()).optional(),

	/**
	 * OPTIONAL. URL of a page containing human-readable information that
	 * developers might want or need to know when using the protected resource.
	 */
	resource_documentation: webUriSchema.optional(),

	/**
	 * OPTIONAL. URL that the protected resource provides to read about the
	 * protected resource's requirements on how the client can use the data.
	 */
	resource_policy_uri: webUriSchema.optional(),

	/**
	 * OPTIONAL. URL that the protected resource provides to read about the
	 * protected resource's terms of service.
	 */
	resource_tos_uri: webUriSchema.optional(),
});

export const oauthProtectedResourceMetadataValidator = oauthProtectedResourceMetadataSchema.chain((data) => {
	const url = new URL(data.resource);

	if (url.search) {
		return v.err({
			message: `resource URL must not contain query parameters`,
			path: ['resource'],
		});
	}

	if (url.hash) {
		return v.err({
			message: `resource URL must not contain a fragment`,
			path: ['resource'],
		});
	}

	return v.ok(data);
});

export type OAuthProtectedResourceMetadata = v.Infer<typeof oauthProtectedResourceMetadataSchema>;
