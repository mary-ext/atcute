import type { At, Procedures, Queries } from './lexicons.js';

import { buildFetchHandler, type FetchHandler, type FetchHandlerObject } from './fetch-handler.js';
import { mergeHeaders } from './utils/http.js';

export type HeadersObject = Record<string, string>;

/** Response from XRPC service */
export interface XRPCResponse<T = any> {
	data: T;
	headers: HeadersObject;
}

/** Options for constructing an XRPC error */
export interface XRPCErrorOptions {
	kind?: string;
	description?: string;
	headers?: HeadersObject;
	cause?: unknown;
}

/** Error coming from the XRPC service */
export class XRPCError extends Error {
	override name = 'XRPCError';

	/** Response status */
	status: number;
	/** Response headers */
	headers: HeadersObject;
	/** Error kind */
	kind?: string;
	/** Error description */
	description?: string;

	constructor(status: number, { kind, description, headers, cause }: XRPCErrorOptions = {}) {
		super(`${kind || 'UnspecifiedKind'} > ${description || `Unspecified error description`}`, { cause });

		this.status = status;
		this.kind = kind;
		this.description = description;
		this.headers = headers || {};
	}
}

/** Service proxy options */
export interface XRPCProxyOptions {
	type: 'atproto_pds' | 'atproto_labeler' | 'bsky_fg' | 'bsky_notif' | ({} & string);
	service: At.DID;
}

/** Options for constructing an XRPC */
export interface XRPCOptions {
	handler: FetchHandler | FetchHandlerObject;
	proxy?: XRPCProxyOptions;
}

/** XRPC request options */
export interface XRPCRequestOptions {
	type: 'get' | 'post';
	nsid: string;
	headers?: HeadersInit;
	params?: Record<string, unknown>;
	data?: FormData | Blob | ArrayBufferView | Record<string, unknown>;
	signal?: AbortSignal;
}

/** XRPC response */
export interface XRPCResponse<T = any> {
	data: T;
	headers: HeadersObject;
}

/** Base options for the query/procedure request */
interface BaseRPCOptions {
	/** Request headers to make */
	headers?: HeadersInit;
	/** Signal for aborting the request */
	signal?: AbortSignal;
}

/** Options for the query/procedure request */
export type RPCOptions<T> = BaseRPCOptions &
	(T extends { params: any } ? { params: T['params'] } : {}) &
	(T extends { input: any } ? { data: T['input'] } : {});

type OutputOf<T> = T extends { output: any } ? T['output'] : never;

export class XRPC {
	handle: FetchHandler;
	proxy: XRPCProxyOptions | undefined;

	constructor({ handler, proxy }: XRPCOptions) {
		this.handle = buildFetchHandler(handler);
		this.proxy = proxy;
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
		return this.request({ type: 'get', nsid: nsid, ...(options as any) });
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
		return this.request({ type: 'post', nsid: nsid, ...(options as any) });
	}

	/** Makes a request to the XRPC service */
	async request(options: XRPCRequestOptions): Promise<XRPCResponse> {
		const data = options.data;

		const url = `/xrpc/${options.nsid}` + constructSearchParams(options.params);
		const isInputJson = isJsonValue(data);

		const response = await this.handle(url, {
			method: options.type,
			signal: options.signal,
			body: isInputJson ? JSON.stringify(data) : data,
			headers: mergeHeaders(options.headers, {
				'content-type': isInputJson ? 'application/json' : null,
				'atproto-proxy': constructProxyHeader(this.proxy),
			}),
		});

		const responseStatus = response.status;
		const responseHeaders = Object.fromEntries(response.headers);
		const responseType = responseHeaders['content-type'];

		let promise: Promise<unknown> | undefined;
		let ret: unknown;

		if (responseType) {
			if (responseType.startsWith('application/json')) {
				promise = response.json();
			} else if (responseType.startsWith('text/')) {
				promise = response.text();
			}
		}

		try {
			ret = await (promise || response.arrayBuffer().then((buffer) => new Uint8Array(buffer)));
		} catch (err) {
			throw new XRPCError(2, {
				cause: err,
				kind: 'InvalidResponse',
				description: `Failed to parse response body`,
				headers: responseHeaders,
			});
		}

		if (responseStatus === 200) {
			return {
				data: ret,
				headers: responseHeaders,
			};
		}

		if (isErrorResponse(ret)) {
			throw new XRPCError(responseStatus, {
				kind: ret.error,
				description: ret.message,
				headers: responseHeaders,
			});
		}

		throw new XRPCError(responseStatus, { headers: responseHeaders });
	}
}

const constructProxyHeader = (proxy: XRPCProxyOptions | undefined): string | null => {
	if (proxy) {
		return `${proxy.service}#${proxy.type}`;
	}

	return null;
};

const constructSearchParams = (params: Record<string, unknown> | undefined): string => {
	let searchParams: URLSearchParams | undefined;

	for (const key in params) {
		const value = params[key];

		if (value !== undefined) {
			searchParams ??= new URLSearchParams();

			if (Array.isArray(value)) {
				for (let idx = 0, len = value.length; idx < len; idx++) {
					const val = value[idx];
					searchParams.append(key, '' + val);
				}
			} else {
				searchParams.set(key, '' + value);
			}
		}
	}

	return searchParams ? `?` + searchParams.toString() : '';
};

const isJsonValue = (o: unknown): o is Record<string, unknown> => {
	if (typeof o !== 'object' || o === null) {
		return false;
	}

	if ('toJSON' in o) {
		return true;
	}

	const proto = Object.getPrototypeOf(o);
	return proto === null || proto === Object.prototype;
};

const isErrorResponse = (value: any): value is ErrorResponseBody => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const kindType = typeof value.error;
	const messageType = typeof value.message;

	return (
		(kindType === 'undefined' || kindType === 'string') &&
		(messageType === 'undefined' || messageType === 'string')
	);
};

interface ErrorResponseBody {
	error?: string;
	message?: string;
}

export const clone = (rpc: XRPC): XRPC => {
	return new XRPC({ handler: rpc.handle, proxy: rpc.proxy });
};

export const withProxy = (rpc: XRPC, options: XRPCProxyOptions) => {
	return new XRPC({ handler: rpc.handle, proxy: options });
};
