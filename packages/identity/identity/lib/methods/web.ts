import type { Did } from '@atcute/lexicons/syntax';

/** @deprecated use `isWebDid` instead */
export const WEB_DID_RE =
	/^did:web:([a-zA-Z0-9%-]+(?:(?:\.[a-zA-Z0-9%-]+)*(?:\.[a-zA-Z]{2,}))?)?((?::[a-zA-Z0-9\-%.]+)+)?$/;

/** @deprecated use `isAtprotoWebDid` instead */
export const ATPROTO_WEB_DID_RE =
	/^did:web:([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,})|localhost(?:%3[aA]\d+)?)$/;

/**
 * checks if input is a did:web identifier, note that you should probably use
 * `isAtprotoWebDid` for atproto-related cases as atproto only supports a subset
 * of the did:web specification (namely, no custom paths)
 */
export const isWebDid = (input: string): input is Did<'web'> => {
	return input.length >= 9 && WEB_DID_RE.test(input);
};

/**
 * checks if input is a did:web identifier that is supported by atproto
 */
export const isAtprotoWebDid = (input: string): input is Did<'web'> => {
	return input.length >= 12 && ATPROTO_WEB_DID_RE.test(input);
};

/**
 * normalize a did:web identifier
 */
export const normalizeWebDid = (did: Did<'web'>): Did<'web'> => {
	const [host, ...paths] = did.slice(8).split(':').map(decodeURIComponent);

	let normalized = `did:web:${encodeURIComponent(host.toLowerCase())}`;
	if (paths.length > 0) {
		normalized += `:${paths.join(':')}`;
	}

	return normalized as Did<'web'>;
};

/**
 * converts did:web identifier into the DID document's URL
 */
export const webDidToDocumentUrl = (did: Did<'web'>): URL => {
	const [host, ...paths] = did.slice(8).split(':').map(decodeURIComponent);

	let pathname = '/' + paths.join('/');
	if (pathname === '/') {
		pathname = `/.well-known/did.json`;
	} else {
		pathname += `/did.json`;
	}

	const url = new URL(`https://${host}${pathname}`);
	if (url.hostname === 'localhost') {
		url.protocol = 'http:';
	}

	return url;
};
