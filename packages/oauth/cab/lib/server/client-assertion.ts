import { createClientAssertion as createClientAssertionJwt } from '@atcute/oauth-crypto';
import type { Keyset } from '@atcute/oauth-keyset';

/**
 * options for creating a client assertion
 */
export interface CreateClientAssertionOptions {
	/** client ID (used as iss and sub) */
	clientId: string;
	/** authorization server issuer (used as aud) */
	audience: string;
	/** JWK thumbprint of the DPoP key to bind to (cnf.jkt) */
	jkt: string;
	/** client's private keyset */
	keyset: Keyset;
	/** optional algorithms supported by the server */
	serverAlgs?: readonly string[];
}

/**
 * result of client assertion creation
 */
export interface ClientAssertionResult {
	/** the signed JWT assertion */
	client_assertion: string;
}

/**
 * creates a DPoP-bound client assertion per RFC 7523.
 *
 * the assertion includes a `cnf.jkt` claim binding it to the provided DPoP key thumbprint.
 *
 * @param options creation options
 * @returns client assertion credentials
 */
export const createClientAssertion = async (
	options: CreateClientAssertionOptions,
): Promise<ClientAssertionResult> => {
	const { clientId, audience, jkt, keyset, serverAlgs } = options;

	// find a compatible key
	const { key } = keyset.findForSigning(serverAlgs);
	const assertion = await createClientAssertionJwt({
		clientId,
		audience,
		jkt,
		key,
	});

	return {
		client_assertion: assertion,
	};
};
