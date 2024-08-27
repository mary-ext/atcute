/** Fetch handler function */
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

export interface SimpleFetchHandlerOptions {
	service: string | URL;
	fetch?: typeof globalThis.fetch;
}

export const simpleFetchHandler = ({
	service,
	fetch: _fetch = fetch,
}: SimpleFetchHandlerOptions): FetchHandler => {
	return async (pathname, init) => {
		const url = new URL(pathname, service);
		return _fetch(url, init);
	};
};
