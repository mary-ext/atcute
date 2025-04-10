import type { At, Procedures, Queries } from './lexicons.js';

import { buildFetchHandler, type FetchHandler, type FetchHandlerObject } from './fetch-handler.js';
import { mergeHeaders } from './utils/http.js';

// #region Type utilities
type RequiredKeysOf<TType extends object> = TType extends any
	? Exclude<
			{
				[Key in keyof TType]: TType extends Record<Key, TType[Key]> ? Key : never;
			}[keyof TType],
			undefined
		>
	: never;

type HasRequiredKeys<TType extends object> = RequiredKeysOf<TType> extends never ? false : true;

// #endregion

// #region Type definitions for response formats
type ResponseFormat = 'json' | 'blob' | 'bytes' | 'stream';

type FormattedResponse<TDef> = {
	json: TDef extends { response: { json: infer TData } } ? TData : unknown;
	blob: Blob;
	bytes: Uint8Array;
	stream: ReadableStream<Uint8Array>;
};

// #endregion

// #region Type definitions for request options
type BaseRequestOptions = {
	signal?: AbortSignal;
	headers?: HeadersInit;
};

export type QueryRequestOptions<TDef> = BaseRequestOptions &
	(TDef extends { response: infer TResponse }
		? TResponse extends { json: any }
			? // query has JSON response, format is optionally specified
				{ as?: ResponseFormat | null }
			: // query doesn't have JSON response, format needs to be specified
				{ as: ResponseFormat | null }
		: // query doesn't specify a response, format can be null to ensure no response
			{ as: ResponseFormat | null }) &
	(TDef extends { params: infer TParams } ? { params: TParams } : { params?: Record<string, unknown> });

export type ProcedureRequestOptions<TDef> = BaseRequestOptions &
	(TDef extends { response: infer TResponse }
		? TResponse extends { json: any }
			? // procedure has JSON response, format is optionally specified
				{ as?: ResponseFormat | null }
			: // procedure doesn't have JSON response, format needs to be specified
				{ as: ResponseFormat | null }
		: // procedure doesn't specify a response, format can be null to ensure no response
			{ as: ResponseFormat | null }) &
	(TDef extends { params: infer TParams } ? { params: TParams } : { params?: Record<string, unknown> }) &
	(TDef extends { input: infer TInput } ? { input: TInput } : { input?: Record<string, unknown> });

type InternalRequestOptions = BaseRequestOptions & {
	as?: ResponseFormat | null;
	params?: Record<string, unknown>;
	input?: Record<string, unknown> | Blob | BufferSource | ReadableStream;
};

// #endregion

// #region Type definitions for client response
/** standard XRPC error payload structure */
export type XRPCErrorPayload = {
	/** error name */
	error: string;
	/** error description */
	message?: string;
};

type BaseClientResponse = {
	/** response status */
	status: number;
	/** response headers */
	headers: Headers;
};

/** represents a successful response returned by the client */
export type SuccessClientResponse<TDef, TInit> = BaseClientResponse & {
	ok: true;
	/** response data */
	data: TInit extends { as: infer TFormat }
		? TFormat extends ResponseFormat
			? FormattedResponse<TDef>[TFormat]
			: TFormat extends null
				? null
				: never
		: TDef extends { response: { json: infer TData } }
			? TData
			: never;
};

/** represents a failed response returned by the client */
export type FailedClientResponse = BaseClientResponse & {
	ok: false;
	/** response data */
	data: XRPCErrorPayload;
};

/** represents a response returned by the client */
export type ClientResponse<TDef, TInit> = SuccessClientResponse<TDef, TInit> | FailedClientResponse;

// #endregion

// #region Client
/** options for configuring service proxying */
export type ServiceProxyOptions = {
	/** DID identifier that the upstream service should look up */
	did: At.Did;
	/**
	 * the specific service ID within the resolved DID document's `service` array
	 * that the upstream service should forward requests to.
	 *
	 * must start with `#`
	 *
	 * common values include:
	 * - `#atproto_pds` (personal data server)
	 * - `#atproto_labeler` (labeler service)
	 * - `#bsky_chat` (Bluesky chat service)
	 */
	serviceId: `#${string}`;
};

/** options for configuring the client */
export type ClientOptions = {
	/** the underlying fetch handler it should make requests with */
	handler: FetchHandler | FetchHandlerObject;
	/** service proxy configuration */
	proxy?: ServiceProxyOptions | null;
};

const JSON_CONTENT_TYPE_RE = /\bapplication\/json\b/;

/** XRPC API client */
export class Client<TQueries = Queries, TProcedures = Procedures> {
	handler: FetchHandler;
	proxy: ServiceProxyOptions | null;

	constructor({ handler, proxy = null }: ClientOptions) {
		this.handler = buildFetchHandler(handler);
		this.proxy = proxy;
	}

	/**
	 * clones this XRPC client
	 * @param opts options to merge with
	 * @returns the cloned XRPC client
	 */
	clone({ handler = this.handler, proxy = this.proxy }: Partial<ClientOptions> = {}): Client<
		TQueries,
		TProcedures
	> {
		return new Client({ handler, proxy });
	}

	/**
	 * performs an XRPC query request (HTTP GET)
	 * @param name NSID of the query
	 * @param options query options
	 */
	get<TName extends keyof TQueries, TInit extends QueryRequestOptions<TQueries[TName]>>(
		name: TName,
		...options: HasRequiredKeys<TInit> extends true ? [init: TInit] : [init?: TInit]
	): Promise<ClientResponse<TQueries[TName], TInit>>;

	get(name: string, options: InternalRequestOptions = {}) {
		return this.#perform('get', name, options);
	}

	/**
	 * performs an XRPC procedure request (HTTP POST)
	 * @param name NSID of the procedure
	 * @param options procedure options
	 */
	post<TName extends keyof TProcedures, TInit extends ProcedureRequestOptions<TProcedures[TName]>>(
		name: TName,
		...options: HasRequiredKeys<TInit> extends true ? [init: TInit] : [init?: TInit]
	): Promise<ClientResponse<TProcedures[TName], TInit>>;

	post(name: string, options: InternalRequestOptions = {}) {
		return this.#perform('post', name, options);
	}

	async #perform(
		method: 'get' | 'post',
		name: string,
		{ signal, as: format = 'json', headers, input, params }: InternalRequestOptions,
	) {
		const isWebInput =
			input &&
			(input instanceof Blob ||
				ArrayBuffer.isView(input) ||
				input instanceof ArrayBuffer ||
				input instanceof ReadableStream);

		const url = `/xrpc/${name}` + _constructSearchParams(params);

		const response = await this.handler(url, {
			method,
			signal,
			body: input && !isWebInput ? JSON.stringify(input) : input,
			headers: mergeHeaders(headers, {
				'content-type': input && !isWebInput ? 'application/json' : null,
				'atproto-proxy': _constructProxyHeader(this.proxy),
			}),
		});

		{
			const status = response.status;
			const headers = response.headers;

			const type = headers.get('content-type');

			if (status !== 200) {
				let json: any;

				if (type != null && JSON_CONTENT_TYPE_RE.test(type)) {
					// it should be okay to swallow the parsing error here
					try {
						const parsed = await response.json();
						if (isXRPCErrorPayload(parsed)) {
							json = parsed;
						}
					} catch {}
				} else {
					await response.body?.cancel();
				}

				return {
					ok: false,
					status: status,
					headers: headers,
					data: json ?? {
						error: `UnknownXRPCError`,
						message: `Request failed with status code ${status}`,
					},
				};
			}

			{
				let data: any;
				switch (format) {
					case 'json': {
						if (type != null && JSON_CONTENT_TYPE_RE.test(type)) {
							// we shouldn't be handling parsing errors
							data = await response.json();
						} else {
							await response.body?.cancel();

							throw new TypeError(`Invalid response content-type (got ${type})`);
						}

						break;
					}

					case null: {
						data = null;

						await response.body?.cancel();

						if (type != null) {
							throw new TypeError(`Invalid response content-type (got ${type})`);
						}

						break;
					}

					case 'blob': {
						data = await response.blob();
						break;
					}
					case 'bytes': {
						data = new Uint8Array(await response.arrayBuffer());
						break;
					}
					case 'stream': {
						data = response.body!;
						break;
					}
				}

				return {
					ok: true,
					status: status,
					headers: headers,
					data: data,
				};
			}
		}
	}
}

// #endregion

// #region Utility functions
const _constructSearchParams = (params: Record<string, unknown> | undefined): string => {
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

const _constructProxyHeader = (proxy: ServiceProxyOptions | null | undefined): string | null => {
	if (proxy != null) {
		return `${proxy.did}${proxy.serviceId}`;
	}

	return null;
};

export const isXRPCErrorPayload = (input: any): input is XRPCErrorPayload => {
	if (typeof input !== 'object' || input == null) {
		return false;
	}

	const kindType = typeof input.error;
	const messageType = typeof input.message;

	return kindType === 'string' && (messageType === 'undefined' || messageType === 'string');
};
// #endregion

// #region Optimistic response helper
type SuccessData<R> = R extends { ok: true; data: infer D } ? D : never;

/**
 * takes in the response returned by the client, and either returns the data if
 * it is a successful response, or throws if it's a failed response.
 * @param input either a ClientResponse, or a promise that resolves to a ClientResponse
 * @returns the data from a successful response
 *
 * @example
 * const data = await ok(client.get('com.atproto.server.describeServer'));
 * //    ^? ComAtprotoServerDescribeServer.Output
 */
export const ok: {
	<T extends Promise<ClientResponse<any, any>>>(promise: T): Promise<SuccessData<Awaited<T>>>;
	<T extends ClientResponse<any, any>>(response: T): SuccessData<T>;
} = (input: Promise<ClientResponse<any, any>> | ClientResponse<any, any>): any => {
	if (input instanceof Promise) {
		return input.then(ok);
	}

	if (input.ok) {
		return input.data;
	}

	throw new ClientResponseError(input);
};

/** options when constructing a ClientResponseError */
export type ClientResponseErrorOptions = {
	status: number;
	headers?: Headers;
	data: XRPCErrorPayload;
};

/** represents an error response returned by the client */
export class ClientResponseError extends Error {
	/** error name returned by service */
	readonly error: string;
	/** error message returned by service */
	readonly description?: string;

	/** response status */
	readonly status: number;
	/** response headers */
	readonly headers: Headers;

	constructor({ status, headers = new Headers(), data }: ClientResponseErrorOptions) {
		super(`${data.error} > ${data.message ?? '(unspecified description)'}`);

		this.name = 'ClientResponseError';

		this.error = data.error;
		this.description = data.message;

		this.status = status;
		this.headers = headers;
	}
}

// #endregion
