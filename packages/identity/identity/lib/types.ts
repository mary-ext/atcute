import type { Did } from '@atcute/lexicons';

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
	'@context'?: string[];
	id: Did;
	controller?: Did | Did[];
	alsoKnownAs?: string[];
	verificationMethod?: VerificationMethod[];
	authentication?: (string | VerificationMethod)[];
	service?: Service[];
}
