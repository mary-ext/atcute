import type { At } from '@atcute/client/lexicons';

const isUrlParseSupported = 'parse' in URL;

export const isDid = (value: string): value is At.Did => {
	return value.startsWith('did:');
};

export const isValidUrl = (urlString: string): boolean => {
	let url: URL | null = null;
	if (isUrlParseSupported) {
		url = URL.parse(urlString);
	} else {
		try {
			url = new URL(urlString);
		} catch {}
	}

	if (url !== null) {
		return url.protocol === 'https:' || url.protocol === 'http:';
	}

	return false;
};
