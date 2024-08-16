/**
 * @module
 * Handles the actual XRPC client functionalities.
 */

import type { At, Procedures, Queries } from './lexicons.ts';

export type Headers = Record<string, string>;

/** Possible response status from an XRPC service, status <100 is used for the library itself. */
export const enum ResponseType {
	/** Unknown error from the library */
	Unknown = 1,
	/** The server returned an invalid response */
	InvalidResponse = 2,

	/** Successful response from the service */
	Success = 200,
	/** Request was considered invalid by the service */
	InvalidRequest = 400,
	/** Service requires an authentication token */
	AuthRequired = 401,
	/** Request is forbidden by the service */
	Forbidden = 403,
	/** Not a XRPC service */
	XRPCNotSupported = 404,
	/** Payload is considered too large by the service */
	PayloadTooLarge = 413,
	/** Ratelimit was exceeded */
	RateLimitExceeded = 429,
	/** Internal server error */
	InternalServerError = 500,
	/** Method hasn't been implemented */
	MethodNotImplemented = 501,
	/** Failure by an upstream service */
	UpstreamFailure = 502,
	/** Not enough resources */
	NotEnoughResouces = 503,
	/** Timeout from upstream service */
	UpstreamTimeout = 504,
}

/** XRPC response status which are recoverable (network error) */
export const RECOVERABLE_RESPONSE_STATUS: number[] = [1, 408, 425, 429, 500, 502, 503, 504, 522, 524];

/** Request type, either query (GET) or procedure (POST) */
export type RequestType = 'get' | 'post';

/** XRPC that gets passed around middlewares and eventually to the service. */
export interface XRPCRequest {
	service: string;
	type: RequestType;
	nsid: string;
	headers: Headers;
	params: Record<string, unknown>;
	encoding?: string;
	data?: FormData | Blob | ArrayBufferView | Record<string, unknown>;
	signal?: AbortSignal;
}

/** Response from XRPC service */
export interface XRPCResponse<T = any> {
	data: T;
	headers: Headers;
}

/** Options for constructing an XRPC error */
export interface XRPCErrorOptions {
	kind?: string;
	message?: string;
	headers?: Headers;
	cause?: unknown;
}

/** Error coming from the XRPC service */
export class XRPCError extends Error {
	override name = 'XRPCError';

	/** Response status */
	status: number;
	/** Response headers */
	headers: Headers;
	/** Error kind */
	kind?: string;

	constructor(status: number, { kind, message, headers, cause }: XRPCErrorOptions = {}) {
		super(message || `Unspecified error message`, { cause });

		this.status = status;
		this.kind = kind;
		this.headers = headers || {};
	}
}

/** Response returned from middlewares and XRPC service */
export interface XRPCFetchReturn {
	status: number;
	headers: Headers;
	body: unknown;
}

/** Fetch function */
export type XRPCFetch = (req: XRPCRequest) => Promise<XRPCFetchReturn>;
/** Function that constructs a middleware */
export type XRPCHook = (next: XRPCFetch) => XRPCFetch;

/** Options for constructing an XRPC class */
export interface XRPCOptions {
	service: string;
}

/** Base options for the query/procedure request */
interface BaseRPCOptions {
	/** `Content-Type` encoding for the input, defaults to `application/json` if passing a JSON object */
	encoding?: string;
	/** Request headers to make */
	headers?: Headers;
	/** Signal for aborting the request */
	signal?: AbortSignal;
}

/** Options for the query/procedure request */
export type RPCOptions<T> = BaseRPCOptions &
	(T extends { params: any } ? { params: T['params'] } : {}) &
	(T extends { input: any } ? { data: T['input'] } : {});

type OutputOf<T> = T extends { output: any } ? T['output'] : never;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** The client that sends out requests. */
export class XRPC {
	/** The service it should connect to */
	service: string;
	/** XRPC fetch handler */
	fetch: XRPCFetch = fetchHandler;

	constructor(options: XRPCOptions) {
		this.service = options.service;
	}

	/**
	 * Adds a hook to intercept XRPC requests.
	 * Hooks are executed from last-registered to first-registered
	 * @param fn Hook function
	 */
	hook(fn: XRPCHook) {
		this.fetch = fn(this.fetch);
	}

	/**
	 * Makes a query (GET) request
	 * @param nsid Namespace ID of a query endpoint
	 * @param options Options to include like parameters
	 * @returns The response of the request
	 */
	get<K extends keyof Queries>(
		nsid: K,
		options: RPCOptions<Queries[K]>,
	): Promise<XRPCResponse<OutputOf<Queries[K]>>> {
		return this.#call({ type: 'get', nsid: nsid as any, ...(options as any) });
	}

	/**
	 * Makes a procedure (POST) request
	 * @param nsid Namespace ID of a procedure endpoint
	 * @param options Options to include like input body or parameters
	 * @returns The response of the request
	 */
	call<K extends keyof Procedures>(
		nsid: K,
		options: RPCOptions<Procedures[K]>,
	): Promise<XRPCResponse<OutputOf<Procedures[K]>>> {
		return this.#call({ type: 'post', nsid: nsid as any, ...(options as any) });
	}

	async #call(request: PartialBy<Omit<XRPCRequest, 'service'>, 'headers' | 'params'>): Promise<XRPCResponse> {
		const { status, headers, body } = await this.fetch({
			...request,
			service: this.service,
			headers: request.headers === undefined ? {} : request.headers,
			params: request.params === undefined ? {} : request.params,
		});

		if (status === ResponseType.Success) {
			return { data: body, headers: headers };
		} else if (isErrorResponse(body)) {
			throw new XRPCError(status, { kind: body.error, message: body.message, headers });
		} else {
			throw new XRPCError(status, { headers });
		}
	}
}

/**
 * Clones an XRPC instance
 * @param rpc Base instance
 * @returns The cloned instance
 */
export const clone = (rpc: XRPC): XRPC => {
	const cloned = new XRPC({ service: rpc.service });
	cloned.fetch = rpc.fetch;

	return cloned;
};

/**
 * Clones an existing XRPC instance, with a proxy on top.
 * @param rpc Base instance
 * @param opts Proxying options
 * @returns Cloned instance with a proxy added
 */
export const withProxy = (rpc: XRPC, opts: ProxyOptions): XRPC => {
	const cloned = clone(rpc);

	cloned.hook((next) => (request) => {
		return next({
			...request,
			headers: {
				...request.headers,
				'atproto-proxy': `${opts.service}#${opts.type}`,
			},
		});
	});

	return cloned;
};

/** Known endpoint types for proxying */
export type ProxyType = 'atproto_labeler' | 'bsky_fg';

/** Options for proxying a request */
export interface ProxyOptions {
	/** Service it should proxy requests to */
	service: At.DID;
	/** The endpoint to connect */
	type: ProxyType | (string & {});
}

/** Default fetch handler */
export const fetchHandler: XRPCFetch = async ({
	service,
	type,
	nsid,
	headers,
	params,
	encoding,
	data: input,
	signal,
}) => {
	const uri = new URL(`/xrpc/${nsid}`, service);
	const searchParams = uri.searchParams;

	for (const key in params) {
		const value = params[key];

		if (value !== undefined) {
			if (Array.isArray(value)) {
				for (let idx = 0, len = value.length; idx < len; idx++) {
					const val = value[idx];
					searchParams.append(key, val);
				}
			} else {
				searchParams.set(key, value as any);
			}
		}
	}

	const isProcedure = type === 'post';
	const isJson =
		typeof input === 'object' &&
		!(input instanceof FormData || input instanceof Blob || ArrayBuffer.isView(input));

	const response = await fetch(uri, {
		signal: signal,
		method: isProcedure ? 'POST' : 'GET',
		headers: encoding || isJson ? { ...headers, 'Content-Type': encoding || 'application/json' } : headers,
		body: isJson ? JSON.stringify(input) : (input as FormData | Blob | ArrayBufferView | undefined),
	});

	const responseHeaders = response.headers;
	const responseType = responseHeaders.get('Content-Type');

	let promise: Promise<unknown> | undefined;
	let data: unknown;

	if (responseType) {
		if (responseType.startsWith('application/json')) {
			promise = response.json();
		} else if (responseType.startsWith('text/')) {
			promise = response.text();
		}
	}

	try {
		data = await (promise || response.arrayBuffer().then((buffer) => new Uint8Array(buffer)));
	} catch (err) {
		throw new XRPCError(ResponseType.InvalidResponse, {
			cause: err,
			message: `Failed to parse response body`,
		});
	}

	return {
		status: response.status,
		headers: Object.fromEntries(responseHeaders),
		body: data,
	};
};

/**
 * Check if provided value is an error object
 * @param value Response value
 * @param names If provided, also checks if the error name matches what you expect
 * @returns A boolean on the check
 */
export const isErrorResponse = (value: any, names?: string[]): value is ErrorResponseBody => {
	if (typeof value !== 'object' || !value) {
		return false;
	}

	const kindType = typeof value.error;
	const messageType = typeof value.message;

	return (
		(kindType === 'undefined' || kindType === 'string') &&
		(messageType === 'undefined' || messageType === 'string') &&
		(!names || names.includes(value.error))
	);
};

/** Response body from a thrown query/procedure */
export interface ErrorResponseBody {
	error?: string;
	message?: string;
}
