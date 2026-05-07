import * as v from 'valibot';

import { scopeSchema } from './atcute-client-shared.ts';
import { oauthClientIdDiscoverableSchema } from './oauth-client-id-discoverable.ts';
import { loopbackRedirectUriSchema, oauthRedirectUriSchema } from './oauth-redirect-uri.ts';
import { nonLocalWebUriSchema, privateUseUriSchema, webUriSchema } from './uri.ts';
import { isLoopbackHost } from './utils.ts';

const redirectUrisSchema = v.pipe(
	v.array(oauthRedirectUriSchema),
	v.minLength(1, `must have at least one redirect URI`),
	v.check((arr) => {
		for (const uri of arr) {
			// private-use URIs don't have URL-style credentials
			if (!uri.includes('://')) {
				continue;
			}
			const url = new URL(uri);
			if (url.username || url.password) {
				return false;
			}
		}
		return true;
	}, `redirect URIs must not contain credentials`),
);

/**
 * user-facing client metadata for configuring a loopback public OAuth client.
 *
 * loopback clients are for localhost development and CLI tools. they use
 * `http://localhost` as the client_id origin, which is built automatically
 * from the redirect_uris and scope.
 */
export const loopbackClientMetadataSchema = v.pipe(
	v.looseObject({
		/** must not be provided for loopback clients */
		client_id: v.optional(v.undefined()),

		/**
		 * redirect URIs for authorization responses.
		 *
		 * must be loopback IP addresses (127.0.0.1 or [::1]).
		 * per RFC 8252, port numbers are ignored during redirect URI matching,
		 * allowing ephemeral ports.
		 */
		redirect_uris: redirectUrisSchema,

		/** OAuth scope (must include "atproto") */
		scope: scopeSchema,
	}),
	v.forward(
		v.check((input) => {
			// validate all redirect URIs are loopback
			for (const uri of input.redirect_uris) {
				const result = v.safeParse(loopbackRedirectUriSchema, uri);
				if (!result.success) {
					return false;
				}
				const url = new URL(uri);
				if (!isLoopbackHost(url.hostname) || url.hostname === 'localhost') {
					return false;
				}
			}
			return true;
		}, `loopback clients require loopback redirect URIs (127.0.0.1 or [::1])`),
		['redirect_uris'],
	),
);

export type LoopbackClientMetadata = v.InferOutput<typeof loopbackClientMetadataSchema>;

/**
 * user-facing client metadata for configuring a discoverable public OAuth client.
 *
 * discoverable public clients have an HTTPS client_id URL where metadata is hosted,
 * but don't use a keyset (token_endpoint_auth_method: 'none').
 */
export const discoverablePublicClientMetadataSchema = v.pipe(
	v.looseObject({
		/** discoverable HTTPS client_id URL */
		client_id: oauthClientIdDiscoverableSchema,

		/** redirect URIs for authorization responses */
		redirect_uris: redirectUrisSchema,

		/** OAuth scope (must include "atproto") */
		scope: scopeSchema,

		/**
		 * application type - defaults to 'web'.
		 */
		application_type: v.optional(v.union([v.literal('web'), v.literal('native')])),

		/** optional client homepage */
		client_uri: v.optional(webUriSchema),
		/** optional display name */
		client_name: v.optional(v.string()),
		/** optional policy url */
		policy_uri: v.optional(nonLocalWebUriSchema),
		/** optional terms of service url */
		tos_uri: v.optional(nonLocalWebUriSchema),
		/** optional logo url */
		logo_uri: v.optional(nonLocalWebUriSchema),
	}),
	v.forward(
		v.check((input) => {
			// validate redirect URIs are HTTPS, loopback, or private-use
			for (const uri of input.redirect_uris) {
				// private-use URIs are allowed
				if (!uri.includes('://')) {
					if (!v.safeParse(privateUseUriSchema, uri).success) {
						return false;
					}
					continue;
				}

				const url = new URL(uri);

				// loopback http URIs are allowed for native apps
				if (url.protocol === 'http:' && isLoopbackHost(url.hostname)) {
					continue;
				}

				// otherwise must be https
				if (url.protocol !== 'https:') {
					return false;
				}
			}
			return true;
		}, `redirect URI must use https:, http: loopback, or private-use scheme`),
		['redirect_uris'],
	),
);

export type DiscoverablePublicClientMetadata = v.InferOutput<typeof discoverablePublicClientMetadataSchema>;

/**
 * user-facing client metadata for configuring a public OAuth client.
 *
 * - if `client_id` is omitted: loopback client (for localhost dev / CLI tools)
 * - if `client_id` is provided: discoverable public client (HTTPS URL)
 */
export const publicClientMetadataSchema = v.union([
	loopbackClientMetadataSchema,
	discoverablePublicClientMetadataSchema,
]);

export type PublicClientMetadata = v.InferOutput<typeof publicClientMetadataSchema>;
