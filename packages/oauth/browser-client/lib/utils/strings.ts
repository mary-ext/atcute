const isUrlParseSupported = 'parse' in URL;

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
