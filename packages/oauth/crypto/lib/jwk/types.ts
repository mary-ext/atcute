/** signing algorithms supported by atproto oauth. */
export type SigningAlgorithm =
	| 'ES256'
	| 'ES384'
	| 'ES512'
	| 'PS256'
	| 'PS384'
	| 'PS512'
	| 'RS256'
	| 'RS384'
	| 'RS512';

export interface EcPublicJwk {
	kty: 'EC';
	crv: 'P-256' | 'P-384' | 'P-521';
	x: string;
	y: string;
	alg?: SigningAlgorithm;
	use?: 'sig';
	kid?: string;
}

export interface RsaPublicJwk {
	kty: 'RSA';
	n: string;
	e: string;
	alg?: SigningAlgorithm;
	use?: 'sig';
	kid?: string;
}

export type PublicJwk = EcPublicJwk | RsaPublicJwk;

export interface EcPrivateJwk extends EcPublicJwk {
	alg: SigningAlgorithm;
	d: string;
}

export interface RsaPrivateJwk extends RsaPublicJwk {
	alg: SigningAlgorithm;
	d: string;
	p?: string;
	q?: string;
	dp?: string;
	dq?: string;
	qi?: string;
}

export type PrivateJwk = EcPrivateJwk | RsaPrivateJwk;
