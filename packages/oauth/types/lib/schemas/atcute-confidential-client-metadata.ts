import * as v from "@badrap/valita";

import { atprotoOAuthScopeSchema } from "./atproto-oauth-scope.js";
import { oauthClientIdDiscoverableSchema } from "./oauth-client-id-discoverable.js";
import {
	httpsUriSchema,
	loopbackUriSchema,
	nonLocalWebUriSchema,
	webUriSchema,
} from "./uri.js";
import { isLocalHostname } from "./utils.js";

const SINGLE_SCOPE_RE = /^[\x21\x23-\x5B\x5D-\x7E]+$/;

const singleScopeSchema = v
	.string()
	.assert((input) => SINGLE_SCOPE_RE.test(input), `invalid OAuth scope`);

/**
 * user-facing client metadata for configuring a confidential OAuth client.
 *
 * this is a lean subset of OAuth client metadata, focused on what you actually provide.
 * the library will fill in atproto-required values like `dpop_bound_access_tokens`,
 * `token_endpoint_auth_method`, and default `grant_types` / `response_types`.
 */
export const confidentialClientMetadataSchema = v
	.object({
		/** discoverable https client_id URL (where metadata is hosted) */
		client_id: oauthClientIdDiscoverableSchema,

		/** redirect URIs for authorization responses (must be https) */
		redirect_uris: v
			.array(v.union(loopbackUriSchema, httpsUriSchema))
			.assert((arr) => arr.length > 0, `must have at least one redirect URI`)
			.assert((arr) => {
				for (const uri of arr) {
					const url = new URL(uri);
					if (url.username || url.password) {
						return false;
					}
				}
				return true;
			}, `redirect URIs must not contain credentials`),

		/**
		 * OAuth scope - either:
		 * - a space-separated string (must include "atproto")
		 * - an array of scope strings ('atproto' is added automatically)
		 */
		scope: v.union(
			atprotoOAuthScopeSchema.chain((input) => {
				const scopes = input.split(/\s+/);

				for (let i = 0, len = scopes.length; i < len; i++) {
					const aka = scopes[i];

					for (let j = 0; j < i; j++) {
						if (aka === scopes[j]) {
							return v.err(`duplicate "${aka}" scope`);
						}
					}
				}

				return v.ok(input);
			}),
			v.array(singleScopeSchema).chain((input) => {
				if (!input.includes("atproto")) {
					input = ["atproto", ...input];
				}

				for (let i = 0, len = input.length; i < len; i++) {
					const aka = input[i];

					for (let j = 0; j < i; j++) {
						if (aka === input[j]) {
							return v.err(`duplicate "${aka}" scope`);
						}
					}
				}

				return v.ok(input);
			}),
		),

		/** optional client homepage */
		client_uri: webUriSchema.optional(),
		/** optional display name */
		client_name: v.string().optional(),
		/** optional policy url */
		policy_uri: nonLocalWebUriSchema.optional(),
		/** optional terms of service url */
		tos_uri: nonLocalWebUriSchema.optional(),
		/** optional logo url */
		logo_uri: nonLocalWebUriSchema.optional(),

		/** optional JWKS URL; if omitted, the library will inline jwks from the keyset */
		jwks_uri: httpsUriSchema.optional(),
	})
	.chain((input) => {
		const clientIdUrl = new URL(input.client_id);

		if (input.jwks_uri) {
			if (isLocalHostname(clientIdUrl.hostname)) {
				return v.err({
					message: `clients with local client_id hostnames must not include a jwks_uri`,
					path: ["jwks_uri"],
				});
			} else {
				const jwksUrl = new URL(input.jwks_uri);

				if (jwksUrl.username || jwksUrl.password) {
					return v.err({
						message: `jwks_uri must not contain credentials`,
						path: ["jwks_uri"],
					});
				}

				if (isLocalHostname(jwksUrl.hostname)) {
					return v.err({
						message: `jwks_uri hostname is invalid`,
						path: ["jwks_uri"],
					});
				}
			}
		}

		// for discoverable clients, client_uri (if provided) must be same-origin parent of client_id
		if (input.client_uri) {
			const clientUriUrl = new URL(input.client_uri);

			if (isLocalHostname(clientUriUrl.hostname)) {
				return v.err({
					message: `client_uri hostname is invalid`,
					path: ["client_uri"],
				});
			}

			if (clientUriUrl.origin !== clientIdUrl.origin) {
				return v.err({
					message: `client_uri must have the same origin as the client_id`,
					path: ["client_uri"],
				});
			}

			if (clientIdUrl.pathname !== clientUriUrl.pathname) {
				const prefix = clientUriUrl.pathname.endsWith("/")
					? clientUriUrl.pathname
					: `${clientUriUrl.pathname}/`;

				if (!clientIdUrl.pathname.startsWith(prefix)) {
					return v.err({
						message: `client_uri must be a parent URL of the client_id`,
						path: ["client_uri"],
					});
				}
			}
		}

		return v.ok(input);
	});

export type ConfidentialClientMetadata = v.Infer<
	typeof confidentialClientMetadataSchema
>;
