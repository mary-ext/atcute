import { createClientAssertion as createClientAssertionJwt } from '@atcute/oauth-crypto';
import type { ClientAssertionPrivateKey } from '@atcute/oauth-crypto';
import type { Keyset } from '@atcute/oauth-keyset';
import {
	CLIENT_ASSERTION_TYPE_JWT_BEARER,
	FALLBACK_ALG,
	type OAuthAuthorizationServerMetadata,
} from '@atcute/oauth-types';

export { CLIENT_ASSERTION_TYPE_JWT_BEARER };

/**
 * client authentication method. only `private_key_jwt` is supported.
 */
export interface ClientAuthMethod {
	method: 'private_key_jwt';
	/** key ID used for signing */
	kid: string;
}

/**
 * client credentials for a token endpoint request.
 */
export interface ClientCredentials {
	client_id: string;
	client_assertion_type: typeof CLIENT_ASSERTION_TYPE_JWT_BEARER;
	client_assertion: string;
}

/**
 * factory function that produces client credentials for each request.
 */
export type ClientCredentialsFactory = () => Promise<ClientCredentials>;

/**
 * negotiates the client authentication method with the authorization server.
 *
 * @param serverMetadata authorization server metadata
 * @param keyset client's private keyset
 * @returns negotiated auth method with key ID
 * @throws if server doesn't support `private_key_jwt` or no compatible key exists
 */
export const negotiateClientAuth = (
	serverMetadata: OAuthAuthorizationServerMetadata,
	keyset: Keyset,
): ClientAuthMethod => {
	const supportedMethods = serverMetadata.token_endpoint_auth_methods_supported;

	// verify server supports private_key_jwt
	if (supportedMethods && !supportedMethods.includes('private_key_jwt')) {
		throw new Error(
			`server does not support "private_key_jwt" authentication. ` +
				`supported methods: ${supportedMethods.join(', ')}`,
		);
	}

	// get server's supported signing algorithms
	const supportedAlgs = serverMetadata.token_endpoint_auth_signing_alg_values_supported ?? [FALLBACK_ALG];

	// find a compatible key
	const key = keyset.find({ alg: supportedAlgs });
	if (!key) {
		throw new Error(`no key found compatible with server's signing algorithms: ${supportedAlgs.join(', ')}`);
	}

	return { method: 'private_key_jwt', kid: key.kid };
};

export interface CreateClientAssertionFactoryOptions {
	/** negotiated auth method (contains kid) */
	authMethod: ClientAuthMethod;
	/** authorization server metadata */
	serverMetadata: OAuthAuthorizationServerMetadata;
	/** client ID */
	clientId: string;
	/** client's private keyset */
	keyset: Keyset;
}

/**
 * creates a factory that produces client credentials (JWT assertions) for token requests.
 *
 * @param options factory configuration
 * @returns async function that creates fresh credentials for each request
 * @throws if the key is no longer available in the keyset
 */
export const createClientAssertionFactory = (
	options: CreateClientAssertionFactoryOptions,
): ClientCredentialsFactory => {
	const { authMethod, serverMetadata, clientId, keyset } = options;

	// get server's supported signing algorithms
	const supportedAlgs = serverMetadata.token_endpoint_auth_signing_alg_values_supported ?? [FALLBACK_ALG];

	// find the key matching our negotiated auth method
	const key = keyset.find({ kid: authMethod.kid, alg: supportedAlgs });
	if (!key) {
		throw new Error(`key "${authMethod.kid}" no longer available or compatible`);
	}

	return () => createClientCredentials(key, clientId, serverMetadata.issuer);
};

/**
 * creates a client assertion JWT per RFC 7523.
 *
 * @param key private key to sign with
 * @param clientId client identifier (used as iss and sub)
 * @param audience authorization server issuer (used as aud)
 * @returns client credentials for token request
 * @see {@link https://www.rfc-editor.org/rfc/rfc7523.html#section-3}
 */
const createClientCredentials = async (
	key: ClientAssertionPrivateKey,
	clientId: string,
	audience: string,
): Promise<ClientCredentials> => {
	const assertion = await createClientAssertionJwt({
		clientId,
		audience,
		key,
	});

	return {
		client_id: clientId,
		client_assertion_type: CLIENT_ASSERTION_TYPE_JWT_BEARER,
		client_assertion: assertion,
	};
};
