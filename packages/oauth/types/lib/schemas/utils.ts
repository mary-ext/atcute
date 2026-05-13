/** checks if a hostname is a loopback address */
export const isLoopbackHost = (hostname: string): boolean => {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
};

/** checks if a hostname is an IP address (IPv4 or IPv6) */
export const isHostnameIP = (hostname: string): boolean => {
	// IPv4
	if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
		return true;
	}
	// IPv6
	if (hostname.startsWith('[') && hostname.endsWith(']')) {
		return true;
	}
	return false;
};

/**
 * checks if a hostname is a local/reserved hostname
 *
 * returns true for single-segment hostnames and reserved TLDs
 */
export const isLocalHostname = (hostname: string): boolean => {
	const parts = hostname.split('.');
	if (parts.length < 2) {
		return true;
	}

	const tld = parts.at(-1)!.toLowerCase();
	return tld === 'test' || tld === 'local' || tld === 'localhost' || tld === 'invalid' || tld === 'example';
};

/**
 * extracts the path from a URL without relying on URL constructor normalization
 *
 * this is needed because the URL constructor normalizes paths (e.g., removes `.` and `..` segments), which
 * can be used to bypass validation checks
 */
export const extractUrlPath = (url: string): string => {
	const endOfProtocol = url.startsWith('https://') ? 8 : url.startsWith('http://') ? 7 : -1;
	if (endOfProtocol === -1) {
		throw new TypeError(`url must use https: or http: protocol`);
	}

	const hashIdx = url.indexOf('#', endOfProtocol);
	const questionIdx = url.indexOf('?', endOfProtocol);

	const queryStrIdx = questionIdx !== -1 && (hashIdx === -1 || questionIdx < hashIdx) ? questionIdx : -1;

	const pathEnd =
		hashIdx === -1
			? queryStrIdx === -1
				? url.length
				: queryStrIdx
			: queryStrIdx === -1
				? hashIdx
				: Math.min(hashIdx, queryStrIdx);

	const slashIdx = url.indexOf('/', endOfProtocol);
	const pathStart = slashIdx === -1 || slashIdx > pathEnd ? pathEnd : slashIdx;

	if (endOfProtocol === pathStart) {
		throw new TypeError(`url must contain a host`);
	}

	return url.substring(pathStart, pathEnd) || '/';
};

/** checks if an item is the last occurrence in an array (for duplicate detection) */
export const isLastOccurrence = <T>(item: T, index: number, array: readonly T[]): boolean => {
	return array.lastIndexOf(item) === index;
};

/**
 * checks if a space-separated string contains a specific value
 *
 * optimized version of `input.split(' ').includes(value)`
 */
export const isSpaceSeparatedValue = (value: string, input: string): boolean => {
	const inputLength = input.length;
	const valueLength = value.length;

	if (inputLength < valueLength) {
		return false;
	}

	let idx = input.indexOf(value);
	let idxEnd: number;

	while (idx !== -1) {
		idxEnd = idx + valueLength;

		if (
			// at beginning or preceded by space
			(idx === 0 || input.charCodeAt(idx - 1) === 32) &&
			// at end or followed by space
			(idxEnd === inputLength || input.charCodeAt(idxEnd) === 32)
		) {
			return true;
		}

		idx = input.indexOf(value, idxEnd + 1);
	}

	return false;
};
