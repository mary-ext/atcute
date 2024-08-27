export const mergeHeaders = (
	init: HeadersInit | undefined,
	defaults: Record<string, string | null>,
): HeadersInit | undefined => {
	let headers: Headers | undefined;

	for (const name in defaults) {
		const value = defaults[name];

		if (value !== null) {
			headers ??= new Headers(init);

			if (!headers.has(name)) {
				headers.set(name, value);
			}
		}
	}

	return headers ?? init;
};
