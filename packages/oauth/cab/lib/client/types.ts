/**
 * client assertion credentials returned from a CAB backend.
 */
export interface ClientAssertionCredentials {
	/** the signed JWT assertion */
	client_assertion: string;
	/** the assertion type (always jwt-bearer) */
	client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
}

/**
 * parameters for fetching a client assertion.
 */
export interface FetchClientAssertionParams {
	/** JWK thumbprint of the DPoP key to bind the assertion to */
	jkt: string;
	/** authorization server issuer (audience for the assertion) */
	aud: string;

	/**
	 * create a DPoP proof to prove you possess the key for the claimed jkt.
	 *
	 * @param htu origin and pathname to the CAB backend
	 * @param nonce optional DPoP nonce from the server
	 * @returns DPoP proof that can be included in the request
	 */
	createDpopProof: (htu: string, nonce?: string) => Promise<string>;
}

/**
 * function that fetches a client assertion from a CAB backend.
 */
export type ClientAssertionFetcher = (
	params: FetchClientAssertionParams,
) => Promise<ClientAssertionCredentials>;
