import type { Did } from '../types.js';

export const DID_WEB_RE =
	/^did:web:([a-zA-Z0-9%\-]+(?:(?:\.[a-zA-Z0-9%\-]+)*(?:\.[a-zA-Z]{2,}))?)?((?::[a-zA-Z0-9\-%.]+)+)?$/;

export const ATPROTO_DID_WEB_RE = /^did:web:([a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*(?:\.[a-zA-Z]{2,}))$/;

/**
 * checks if input is a did:web identifier, note that you should probably use
 * `isAtprotoDidWeb` for atproto-related cases as atproto only supports a subset
 * of the did:web specification (namely, no custom paths)
 */
export const isDidWeb = (input: string): input is Did<'web'> => {
	return input.length >= 9 && DID_WEB_RE.test(input);
};

/**
 * checks if input is a did:web identifier that is supported by atproto
 */
export const isAtprotoDidWeb = (input: string): input is Did<'web'> => {
	return input.length >= 12 && ATPROTO_DID_WEB_RE.test(input);
};

/**
 * normalize a did:web identifier
 */
export const normalizeDidWeb = (did: Did<'web'>): Did<'web'> => {
	const [hostname, ...paths] = did.slice(8).split(':').map(decodeURIComponent);

	let normalized = `did:web:${encodeURIComponent(hostname.toLowerCase())}`;
	if (paths.length > 0) {
		normalized += `:${paths.join(':')}`;
	}

	return normalized as Did<'web'>;
};

/**
 * converts did:web identifier into the DID document's URL
 */
export const didWebToDocumentUrl = (did: Did<'web'>): URL => {
	const [hostname, ...paths] = did.slice(8).split(':').map(decodeURIComponent);

	const protocol = hostname === 'localhost' ? 'http:' : 'https:';
	let pathname = '/' + paths.join('/');

	if (pathname === '/') {
		pathname = `/.well-known/did.json`;
	} else {
		pathname += `/did.json`;
	}

	return new URL(`${protocol}//${hostname}${pathname}`);
};
