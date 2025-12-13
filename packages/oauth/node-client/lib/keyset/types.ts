import type { JWK } from 'jose';

/**
 * signing algorithms supported by AT Protocol OAuth.
 *
 * @see {@link https://atproto.com/specs/oauth#confidential-client-authentication}
 */
export type SigningAlgorithm =
	| 'ES256'
	| 'ES384'
	| 'ES512' // EC (ES256 is spec minimum)
	| 'PS256'
	| 'PS384'
	| 'PS512' // RSA-PSS
	| 'RS256'
	| 'RS384'
	| 'RS512'; // RSA

/**
 * private key for client authentication via `private_key_jwt`.
 */
export interface PrivateKey {
	/** key ID, required for `private_key_jwt` */
	kid: string;
	/** signing algorithm */
	alg: SigningAlgorithm;
	/** imported key object for signing */
	key: CryptoKey;
	/** pre-computed public JWK for JWKS export */
	publicJwk: JWK;
}

/** options for importing a private key */
export interface ImportKeyOptions {
	/** override or provide key ID */
	kid?: string;
	/** override or provide algorithm */
	alg?: SigningAlgorithm;
}

/** criteria for finding a key in a keyset */
export interface KeySearchOptions {
	/** find by specific key ID */
	kid?: string;
	/** find by algorithm (single or array of acceptable algs) */
	alg?: string | readonly string[];
}
