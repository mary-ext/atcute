import { mergeHeaders } from './utils/http.js';

/** Actual fetch handler, `url` is expected to only be pathname + search params */
export type FetchHandler = (pathname: string, init: RequestInit) => Promise<Response>;

/** Fetch handler in an object */
export interface FetchHandlerObject {
	handle(this: FetchHandlerObject, pathname: string, init: RequestInit): Promise<Response>;
}

export const buildFetchHandler = (handler: FetchHandler | FetchHandlerObject): FetchHandler => {
	if (typeof handler === 'object') {
		return handler.handle.bind(handler);
	}

	return handler;
};

type MaybeFunction<T> = T | (() => T);

export interface SimpleFetchHandlerOptions {
	service: MaybeFunction<string | URL>;
	headers?: Record<string, string | null>;
	fetch?: typeof globalThis.fetch;
}

export const simpleFetchHandler = ({
	service,
	headers,
	fetch: _fetch = fetch,
}: SimpleFetchHandlerOptions): FetchHandler => {
	return async (pathname, init) => {
		const baseUrl = typeof service === 'function' ? service() : service;
		const url = new URL(pathname, baseUrl);

		return _fetch(url, headers ? { ...init, headers: mergeHeaders(init.headers, headers) } : init);
	};
};
