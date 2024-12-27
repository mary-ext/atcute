/**
 * Represents a public cryptographic key
 */
export interface PublicKey {
	/** Returns a did:key representation of the public key */
	did(): Promise<`did:key:${string}`>;
	/** Verifies a signature against a provided data */
	verify(sig: Uint8Array, data: Uint8Array, options?: VerifyOptions): Promise<boolean>;
	/** Returns the raw public key (compressed ECPoint) as bytes */
	exportPublicKey(format: 'raw'): Promise<Uint8Array>;
	/** Returns the raw public key (compressed ECPoint) as a hex-encoded string */
	exportPublicKey(format: 'rawHex'): Promise<string>;
	/** Returns the public key encoded as multikey */
	exportPublicKey(format: 'multikey'): Promise<string>;
	/** Returns the public key encoded as a Json Web Key */
	exportPublicKey(format: 'jwk'): Promise<JsonWebKey>;
}

/**
 * Represents a private cryptographic key
 */
export interface PrivateKey extends PublicKey {
	/** Signs provided data using the private key */
	sign(data: Uint8Array): Promise<Uint8Array>;
}

/**
 * Represents an exportable private cryptographic key
 */
export interface PrivateKeyExportable extends PrivateKey {
	/** Returns the raw private key as bytes */
	exportPrivateKey(format: 'raw'): Promise<Uint8Array>;
	/** Returns the raw private key as a hex-encoded string */
	exportPrivateKey(format: 'rawHex'): Promise<string>;
	/** Returns the private key encoded as multikey */
	exportPrivateKey(format: 'multikey'): Promise<string>;
	/** Returns the private key encoded as a Json Web Key */
	exportPrivateKey(format: 'jwk'): Promise<JsonWebKey>;
}

export interface VerifyOptions {
	allowMalleableSig?: boolean;
}
