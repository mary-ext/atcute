/**
 * @module
 * Assortment of HTTP utilities
 * This module is exported for convenience and is no way part of public API,
 * it can be removed at any time.
 */

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
