export type DidKeyString = `did:key:${string}`;

/** Represents a public cryptographic key */
export interface PublicKey {
	readonly type: string;
	readonly jwtAlg: string;

	/** Verifies a signature against provided data */
	verify(sig: Uint8Array, data: Uint8Array, options?: VerifyOptions): Promise<boolean>;

	/**
	 * Exports the public key in a specified format:
	 *
	 * - `did`: serialized to did:key
	 * - `jwk`: serialized to JWK (JSON Web Key)
	 * - `multikey`: serialized to multikey string
	 * - `raw`: as raw bytes
	 * - `rawHex`: serialized to base16 string
	 */
	exportPublicKey(format: 'did'): Promise<DidKeyString>;
	exportPublicKey(format: 'jwk'): Promise<JsonWebKey>;
	exportPublicKey(format: 'multikey'): Promise<string>;
	exportPublicKey(format: 'raw'): Promise<Uint8Array<ArrayBuffer>>;
	exportPublicKey(format: 'rawHex'): Promise<string>;
}

/** Represents a private cryptographic key */
export interface PrivateKey extends PublicKey {
	/** Signs provided data using the private key */
	sign(data: Uint8Array): Promise<Uint8Array<ArrayBuffer>>;
}

/** Represents an exportable private cryptographic key */
export interface PrivateKeyExportable extends PrivateKey {
	/**
	 * Exports the private key in a specified format:
	 *
	 * - `jwk`: serialized to JWK (JSON Web Key)
	 * - `multikey`: serialized to multikey string
	 * - `raw`: as raw bytes
	 * - `rawHex`: serialized to base16 string
	 */
	exportPrivateKey(format: 'jwk'): Promise<JsonWebKey>;
	exportPrivateKey(format: 'multikey'): Promise<string>;
	exportPrivateKey(format: 'raw'): Promise<Uint8Array<ArrayBuffer>>;
	exportPrivateKey(format: 'rawHex'): Promise<string>;
}

export interface VerifyOptions {
	allowMalleableSig?: boolean;
}
