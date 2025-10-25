const CLIENT_ASSERTION_TYPE_JWT_BEARER = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';

export interface ClientAssertionCredentials {
	client_assertion: string;
	client_assertion_type: typeof CLIENT_ASSERTION_TYPE_JWT_BEARER;
}

export interface FetchClientAssertionParams {
	/** JWK thumbprint of the DPoP key to bind the assertion to */
	jkt: string;
	/** authorization server issuer (audience for the assertion) */
	aud: string;

	/**
	 * create a DPoP proof to prove you possess the key for the claimed jkt.
	 *
	 * @param htu origin and pathname to your backend
	 * @returns DPoP proof that can be included in the assertion
	 */
	createDpopProof: (htu: string) => Promise<string>;
}

export type ClientAssertionFetcher = (
	params: FetchClientAssertionParams,
) => Promise<ClientAssertionCredentials>;
