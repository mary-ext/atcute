export type Handle = `${string}.${string}`;

export type Did<TMethod extends string = string> = `did:${TMethod}:${string}`;

export type AtprotoDid = Did<'plc' | 'web'>;

export interface VerificationMethod {
	id: string;
	type: string;
	controller: Did;
	publicKeyMultibase?: string;
	publicKeyJwk?: Record<string, unknown>;
}

export interface Service {
	id: string;
	type: string | string[];
	serviceEndpoint: string | Record<string, string> | (string | Record<string, string>)[];
}

export interface DidDocument {
	'@context': string[];
	id: Did;
	controller?: Did | Did[];
	alsoKnownAs?: string[];
	verificationMethod?: VerificationMethod[];
	authentication?: (string | VerificationMethod)[];
	service?: Service[];
}
