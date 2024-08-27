/**
 * @module
 * DID document-related functionalities.
 * This module is exported for convenience and is no way part of public API,
 * it can be removed at any time.
 */

/**
 * Retrieves AT Protocol PDS endpoint from the DID document, if available
 * @param doc DID document
 * @returns The PDS endpoint, if available
 */
export const getPdsEndpoint = (doc: DidDocument): string | undefined => {
	return getServiceEndpoint(doc, '#atproto_pds', 'AtprotoPersonalDataServer');
};

/**
 * Retrieve a service endpoint from the DID document, if available
 * @param doc DID document
 * @param serviceId Service ID
 * @param serviceType Service type
 * @returns The requested service endpoint, if available
 */
export const getServiceEndpoint = (
	doc: DidDocument,
	serviceId: string,
	serviceType: string,
): string | undefined => {
	const did = doc.id;

	const didServiceId = did + serviceId;
	const found = doc.service?.find((service) => service.id === serviceId || service.id === didServiceId);

	if (!found || found.type !== serviceType || typeof found.serviceEndpoint !== 'string') {
		return undefined;
	}

	return validateUrl(found.serviceEndpoint);
};

const validateUrl = (urlStr: string): string | undefined => {
	let url;
	try {
		url = new URL(urlStr);
	} catch {
		return undefined;
	}

	const proto = url.protocol;

	if (url.hostname && (proto === 'http:' || proto === 'https:')) {
		return urlStr;
	}
};

/**
 * DID document
 */
export interface DidDocument {
	id: string;
	alsoKnownAs?: string[];
	verificationMethod?: Array<{
		id: string;
		type: string;
		controller: string;
		publicKeyMultibase?: string;
	}>;
	service?: Array<{
		id: string;
		type: string;
		serviceEndpoint: string | Record<string, unknown>;
	}>;
}
