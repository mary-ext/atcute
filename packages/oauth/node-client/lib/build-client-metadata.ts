import { FALLBACK_ALG } from './constants.js';
import type { Keyset } from './keyset/keyset.js';
import {
	confidentialClientMetadataSchema,
	type ConfidentialClientMetadata,
} from './schemas/atcute-confidential-client-metadata.js';
import type { OAuthClientMetadata } from './schemas/oauth-client-metadata.js';

/**
 * builds an atproto client metadata
 *
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
