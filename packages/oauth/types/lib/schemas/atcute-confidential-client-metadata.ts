import * as v from 'valibot';

import { scopeSchema } from './atcute-client-shared.ts';
import { oauthClientIdDiscoverableSchema } from './oauth-client-id-discoverable.ts';
import { httpsUriSchema, nonLocalWebUriSchema, webUriSchema } from './uri.ts';
import { isLocalHostname } from './utils.ts';

/**
 * user-facing client metadata for configuring a confidential OAuth client.
 *
 * this is a lean subset of OAuth client metadata, focused on what you actually provide. the library will fill
 * in atproto-required values like `dpop_bound_access_tokens`, `token_endpoint_auth_method`, and default
 * `grant_types` / `response_types`.
 */
export const confidentialClientMetadataSchema = v.pipe(
	v.looseObject({
		/** discoverable https client_id URL (where metadata is hosted) */
		client_id: oauthClientIdDiscoverableSchema,

		/** redirect URIs for authorization responses (must be https) */
		redirect_uris: v.pipe(
			v.array(httpsUriSchema),
			v.minLength(1, `must have at least one redirect URI`),
			v.checkItems((uri) => {
				const url = new URL(uri);
				return !url.username && !url.password;
			}, `redirect URI must not contain credentials`),
		),

		scope: scopeSchema,

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

		/** optional JWKS URL; if omitted, the library will inline jwks from the keyset */
		jwks_uri: v.optional(httpsUriSchema),
	}),
	v.forward(
		v.check((input) => !isLocalHostname(new URL(input.client_id).hostname), `client_id hostname is invalid`),
		['client_id'],
	),
	v.forward(
		v.check((input) => {
			if (!input.jwks_uri) {
				return true;
			}
			const jwksUrl = new URL(input.jwks_uri);
			return !(jwksUrl.username || jwksUrl.password);
		}, `jwks_uri must not contain credentials`),
		['jwks_uri'],
	),
	v.forward(
		v.check((input) => {
			if (!input.jwks_uri) {
				return true;
			}
			return !isLocalHostname(new URL(input.jwks_uri).hostname);
		}, `jwks_uri hostname is invalid`),
		['jwks_uri'],
	),
	v.forward(
		v.check((input) => {
			if (!input.client_uri) {
				return true;
			}
			return !isLocalHostname(new URL(input.client_uri).hostname);
		}, `client_uri hostname is invalid`),
		['client_uri'],
	),
	v.forward(
		v.check((input) => {
			if (!input.client_uri) {
				return true;
			}
			const clientUriUrl = new URL(input.client_uri);
			const clientIdUrl = new URL(input.client_id);
			return clientUriUrl.origin === clientIdUrl.origin;
		}, `client_uri must have the same origin as the client_id`),
		['client_uri'],
	),
	v.forward(
		v.check((input) => {
			if (!input.client_uri) {
				return true;
			}
			// for discoverable clients, client_uri (if provided) must be same-origin parent of client_id
			const clientUriUrl = new URL(input.client_uri);
			const clientIdUrl = new URL(input.client_id);
			if (clientIdUrl.pathname === clientUriUrl.pathname) {
				return true;
			}
			const prefix = clientUriUrl.pathname.endsWith('/')
				? clientUriUrl.pathname
				: `${clientUriUrl.pathname}/`;
			return clientIdUrl.pathname.startsWith(prefix);
		}, `client_uri must be a parent URL of the client_id`),
		['client_uri'],
	),
);

export type ConfidentialClientMetadata = v.InferOutput<typeof confidentialClientMetadataSchema>;
