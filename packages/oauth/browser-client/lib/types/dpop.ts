export interface DPoPKey {
	typ: 'ES256';
	/** private key in base64url-encoded pkcs #8 */
	key: string;
	/** base64url-encoded jwt token */
	jwt: string;
}
