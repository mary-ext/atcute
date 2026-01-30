import type { Keyset } from '@atcute/oauth-keyset';

import { FALLBACK_ALG } from './constants.js';
import {
	confidentialClientMetadataSchema,
	type ConfidentialClientMetadata,
} from './schemas/atcute-confidential-client-metadata.js';
import {
	publicClientMetadataSchema,
	type PublicClientMetadata,
} from './schemas/atcute-public-client-metadata.js';
import { DEFAULT_ATPROTO_OAUTH_SCOPE } from './schemas/atproto-oauth-scope.js';
import type { OAuthClientMetadata } from './schemas/oauth-client-metadata.js';

/**
 * builds an atproto client metadata for a confidential client.
 *
 * @param input client metadata
 * @param keyset available keys
 * @returns built client metadata
 */
export const buildClientMetadata = (
	input: ConfidentialClientMetadata,
	keyset: Keyset,
): OAuthClientMetadata => {
	// validate user-facing schema is correct
	const conf = confidentialClientMetadataSchema.parse(input, { mode: 'passthrough' });

	// build full OAuth client metadata (atproto defaults and requirements)
	const metadata: OAuthClientMetadata = {
		client_id: conf.client_id,
		client_name: conf.client_name,
		client_uri: conf.client_uri,
		policy_uri: conf.policy_uri,
		tos_uri: conf.tos_uri,
		logo_uri: conf.logo_uri,
		redirect_uris: conf.redirect_uris,
		scope: Array.isArray(conf.scope) ? conf.scope.join(' ') : conf.scope,

		application_type: 'web',
		subject_type: 'public',
		response_types: ['code'],
		grant_types: ['authorization_code', 'refresh_token'],

		token_endpoint_auth_method: 'private_key_jwt',
		token_endpoint_auth_signing_alg: FALLBACK_ALG,
		dpop_bound_access_tokens: true,

		jwks_uri: conf.jwks_uri,
		jwks: conf.jwks_uri ? undefined : (keyset.publicJwks as OAuthClientMetadata['jwks']),
	};

	// ensure at least one key supports the fallback algorithm
	const signingKeys = Array.from(keyset);
	if (!signingKeys.some((key) => key.alg === FALLBACK_ALG)) {
		throw new TypeError(`"private_key_jwt" requires at least one "${FALLBACK_ALG}" signing key`);
	}

	// if jwks provided inline, ensure ALL signing keys are present
	if (metadata.jwks) {
		const jwksKids = new Set(
			metadata.jwks.keys
				.filter((k) => !k.revoked)
				.map((k) => k.kid)
				.filter(Boolean),
		);

		for (const key of signingKeys) {
			if (!jwksKids.has(key.kid)) {
				throw new TypeError(`signing key "${key.kid}" not found in jwks`);
			}
		}
	}

	return metadata;
};

/**
 * builds a loopback client_id from redirect_uris and scope.
 *
 * @param redirectUris loopback redirect URIs
 * @param scope OAuth scope string
 * @returns loopback client_id URL
 */
const buildLoopbackClientId = (redirectUris: readonly string[], scope: string): string => {
	const params = new URLSearchParams();

	// only include scope if not the default
	if (scope !== DEFAULT_ATPROTO_OAUTH_SCOPE) {
		params.set('scope', scope);
	}

	// include redirect URIs
	for (const uri of redirectUris) {
		params.append('redirect_uri', uri);
	}

	if (params.size > 0) {
		return `http://localhost?${params.toString()}`;
	}

	return 'http://localhost';
};

/**
 * builds an atproto client metadata for a public client.
 *
 * public clients use `token_endpoint_auth_method: 'none'` and don't require a keyset.
 * per AT Protocol spec, they have shorter token lifetimes and cannot use silent sign-in.
 *
 * - if `client_id` is omitted: loopback client (client_id built from redirect_uris/scope)
 * - if `client_id` is provided: discoverable public client
 *
 * @param input public client metadata
 * @returns built client metadata
 */
export const buildPublicClientMetadata = (input: PublicClientMetadata): OAuthClientMetadata => {
	const parsed = publicClientMetadataSchema.parse(input, { mode: 'passthrough' });
	const scope = Array.isArray(parsed.scope) ? parsed.scope.join(' ') : parsed.scope;

	if (parsed.client_id === undefined) {
		// loopback client - server generates metadata from client_id URL
		return {
			client_id: buildLoopbackClientId(parsed.redirect_uris, scope),
			redirect_uris: parsed.redirect_uris,
			scope,

			application_type: 'native',
			response_types: ['code'],
			grant_types: ['authorization_code', 'refresh_token'],

			token_endpoint_auth_method: 'none',
			dpop_bound_access_tokens: true,
		};
	}

	// discoverable public client
	return {
		client_id: parsed.client_id,
		client_name: parsed.client_name,
		client_uri: parsed.client_uri,
		policy_uri: parsed.policy_uri,
		tos_uri: parsed.tos_uri,
		logo_uri: parsed.logo_uri,
		redirect_uris: parsed.redirect_uris,
		scope,

		application_type: parsed.application_type ?? 'web',
		subject_type: 'public',
		response_types: ['code'],
		grant_types: ['authorization_code', 'refresh_token'],

		token_endpoint_auth_method: 'none',
		dpop_bound_access_tokens: true,
	};
};
