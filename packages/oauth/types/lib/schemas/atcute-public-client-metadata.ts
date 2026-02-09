import * as v from '@badrap/valita';

import { atprotoOAuthScopeSchema } from './atproto-oauth-scope.ts';
import { oauthClientIdDiscoverableSchema } from './oauth-client-id-discoverable.ts';
import { loopbackRedirectUriSchema, oauthRedirectUriSchema } from './oauth-redirect-uri.ts';
import { nonLocalWebUriSchema, privateUseUriSchema, webUriSchema } from './uri.ts';
import { isLoopbackHost } from './utils.ts';

const SINGLE_SCOPE_RE = /^[\x21\x23-\x5B\x5D-\x7E]+$/;

const singleScopeSchema = v.string().assert((input) => SINGLE_SCOPE_RE.test(input), `invalid OAuth scope`);

const scopeSchema = v.union(
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
		if (!input.includes('atproto')) {
			input = ['atproto', ...input];
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
);

const redirectUrisSchema = v
	.array(oauthRedirectUriSchema)
	.assert((arr) => arr.length > 0, `must have at least one redirect URI`)
	.assert((arr) => {
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
	}, `redirect URIs must not contain credentials`);

/**
 * user-facing client metadata for configuring a loopback public OAuth client.
 *
 * loopback clients are for localhost development and CLI tools. they use
 * `http://localhost` as the client_id origin, which is built automatically
 * from the redirect_uris and scope.
 */
export const loopbackClientMetadataSchema = v
	.object({
		/** must not be provided for loopback clients */
		client_id: v.undefined().optional(),

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
	})
	.chain((input) => {
		// validate all redirect URIs are loopback
		for (let i = 0; i < input.redirect_uris.length; i++) {
			const uri = input.redirect_uris[i];
			const result = loopbackRedirectUriSchema.try(uri, { mode: 'strict' });
			if (!result.ok) {
				return v.err({
					message: `loopback clients require loopback redirect URIs (127.0.0.1 or [::1]): ${result.message}`,
					path: ['redirect_uris', i],
				});
			}

			const url = new URL(uri);
			if (!isLoopbackHost(url.hostname) || url.hostname === 'localhost') {
				return v.err({
					message: `loopback redirect URIs must use 127.0.0.1 or [::1], not ${url.hostname}`,
					path: ['redirect_uris', i],
				});
			}
		}

		return v.ok(input);
	});

export type LoopbackClientMetadata = v.Infer<typeof loopbackClientMetadataSchema>;

/**
 * user-facing client metadata for configuring a discoverable public OAuth client.
 *
 * discoverable public clients have an HTTPS client_id URL where metadata is hosted,
 * but don't use a keyset (token_endpoint_auth_method: 'none').
 */
export const discoverablePublicClientMetadataSchema = v
	.object({
		/** discoverable HTTPS client_id URL */
		client_id: oauthClientIdDiscoverableSchema,

		/** redirect URIs for authorization responses */
		redirect_uris: redirectUrisSchema,

		/** OAuth scope (must include "atproto") */
		scope: scopeSchema,

		/**
		 * application type - defaults to 'web'.
		 */
		application_type: v.union(v.literal('web'), v.literal('native')).optional(),

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
	})
	.chain((input) => {
		// validate redirect URIs are HTTPS, loopback, or private-use
		for (let i = 0; i < input.redirect_uris.length; i++) {
			const uri = input.redirect_uris[i];

			// private-use URIs are allowed
			if (!uri.includes('://')) {
				const result = privateUseUriSchema.try(uri, { mode: 'strict' });
				if (!result.ok) {
					return v.err({
						message: `invalid redirect URI: ${result.message}`,
						path: ['redirect_uris', i],
					});
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
				return v.err({
					message: `redirect URI must use https:, http: loopback, or private-use scheme`,
					path: ['redirect_uris', i],
				});
			}
		}

		return v.ok(input);
	});

export type DiscoverablePublicClientMetadata = v.Infer<typeof discoverablePublicClientMetadataSchema>;

/**
 * user-facing client metadata for configuring a public OAuth client.
 *
 * - if `client_id` is omitted: loopback client (for localhost dev / CLI tools)
 * - if `client_id` is provided: discoverable public client (HTTPS URL)
 */
export const publicClientMetadataSchema = v.union(
	loopbackClientMetadataSchema,
	discoverablePublicClientMetadataSchema,
);

export type PublicClientMetadata = v.Infer<typeof publicClientMetadataSchema>;
