import { createClientAssertion, type ClientAssertionPrivateJwk } from '@atcute/oauth-crypto';
import type { Keyset } from '@atcute/oauth-keyset';
import {
	CLIENT_ASSERTION_TYPE_JWT_BEARER,
	FALLBACK_ALG,
	type OAuthAuthorizationServerMetadata,
} from '@atcute/oauth-types';

/**
 * client authentication method for confidential clients using `private_key_jwt`.
 */
export interface ConfidentialClientAuthMethod {
	method: 'private_key_jwt';
	/** key ID used for signing */
	kid: string;
}

/**
 * client authentication method for public clients using `none`.
 */
export interface PublicClientAuthMethod {
	method: 'none';
}

/**
 * client authentication method.
 *
 * - `private_key_jwt`: confidential clients that authenticate with a JWT assertion
 * - `none`: public clients that don't authenticate at the token endpoint
 */
export type ClientAuthMethod = ConfidentialClientAuthMethod | PublicClientAuthMethod;

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
 *
 * returns `undefined` for public clients (no authentication).
 */
export type ClientCredentialsFactory = () => Promise<ClientCredentials | undefined>;

/**
 * negotiates the client authentication method with the authorization server.
 *
 * @param serverMetadata authorization server metadata
 * @param keyset client's private keyset, or undefined for public clients
 * @returns negotiated auth method
 * @throws if server doesn't support the required authentication method
 */
export const negotiateClientAuth = (
	serverMetadata: OAuthAuthorizationServerMetadata,
	keyset: Keyset | undefined,
): ClientAuthMethod => {
	const supportedMethods = serverMetadata.token_endpoint_auth_methods_supported;

	// public client - no keyset
	if (keyset === undefined) {
		if (supportedMethods && !supportedMethods.includes('none')) {
			throw new Error(
				`server does not support "none" authentication for public clients. ` +
					`supported methods: ${supportedMethods.join(', ')}`,
			);
		}
		return { method: 'none' };
	}

	// confidential client - verify server supports private_key_jwt
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
	/** negotiated auth method */
	authMethod: ClientAuthMethod;
	/** authorization server metadata */
	serverMetadata: OAuthAuthorizationServerMetadata;
	/** client ID */
	clientId: string;
	/** client's private keyset, or undefined for public clients */
	keyset: Keyset | undefined;
}

/**
 * creates a factory that produces client credentials (JWT assertions) for token requests.
 *
 * for public clients (authMethod.method === 'none'), returns a factory that produces `undefined`.
 *
 * @param options factory configuration
 * @returns async function that creates fresh credentials for each request, or undefined for public clients
 * @throws if the key is no longer available in the keyset (confidential clients only)
 */
export const createClientAssertionFactory = (
	options: CreateClientAssertionFactoryOptions,
): ClientCredentialsFactory => {
	const { authMethod, serverMetadata, clientId, keyset } = options;

	// public client - no credentials
	if (authMethod.method === 'none') {
		return async () => undefined;
	}

	// confidential client - keyset is required
	if (keyset === undefined) {
		throw new Error('keyset is required for confidential clients');
	}

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
	key: ClientAssertionPrivateJwk,
	clientId: string,
	audience: string,
): Promise<ClientCredentials> => {
	const assertion = await createClientAssertion({
		client_id: clientId,
		aud: audience,
		key,
	});

	return {
		client_id: clientId,
		client_assertion_type: CLIENT_ASSERTION_TYPE_JWT_BEARER,
		client_assertion: assertion,
	};
};
