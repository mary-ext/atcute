import type { Did } from '@atcute/lexicons';
import type { XRPCProcedures, XRPCQueries } from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';
import type {
	InferInput,
	InferOutput,
	ObjectSchema,
	XRPCBlobBodyParam,
	XRPCLexBodyParam,
	XRPCProcedureMetadata,
	XRPCQueryMetadata,
} from '@atcute/lexicons/validations';

import { buildFetchHandler, type FetchHandler, type FetchHandlerObject } from './fetch-handler.ts';

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
	json: TDef extends XRPCQueryMetadata<any, infer Body extends XRPCLexBodyParam, any>
		? InferOutput<Body['schema']>
		: TDef extends XRPCProcedureMetadata<any, any, infer Body extends XRPCLexBodyParam, any>
			? InferOutput<Body['schema']>
			: unknown;
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
	(TDef extends XRPCQueryMetadata<infer Params, infer Output, any>
		? (Params extends ObjectSchema
				? // query has parameters
					{ params: InferInput<Params> }
				: // query has no parameters
					{ params?: Record<string, unknown> }) &
				(Output extends XRPCLexBodyParam // query has JSON response, format is optionally specified
					? { as?: ResponseFormat | null }
					: // query doesn't have JSON response, format needs to be specified
						{ as: ResponseFormat | null })
		: {
				as: ResponseFormat | null;
				params?: Record<string, unknown>;
			});

export type ProcedureRequestOptions<TDef> = BaseRequestOptions &
	(TDef extends XRPCProcedureMetadata<infer Params, infer Input, infer Output, any>
		? (Params extends ObjectSchema
				? // procedure has parameters
					{ params: InferInput<Params> }
				: // procedure has no parameters
					{ params?: Record<string, unknown> }) &
				(Input extends XRPCLexBodyParam
					? // procedure requires JSON input
						{ input: InferInput<Input['schema']> }
					: Input extends XRPCBlobBodyParam
						? // procedure requires blob
							{ input: Blob | ArrayBuffer | ArrayBufferView | ReadableStream }
						: // procedure doesn't specify input
							{ input?: Record<string, unknown> | Blob | ArrayBuffer | ArrayBufferView | ReadableStream }) &
				(Output extends XRPCLexBodyParam
					? // procedure has JSON response, format is optionally specified
						{ as?: ResponseFormat | null }
					: // procedure doesn't have JSON response, format needs to be specified
						{ as: ResponseFormat | null })
		: {
				as: ResponseFormat | null;
				input?: Record<string, unknown> | Blob | ArrayBuffer | ArrayBufferView | ReadableStream;
				params?: Record<string, unknown>;
			});

export type CallRequestOptions<TMeta> = BaseRequestOptions &
	// as is required if the endpoint returns blob, optional otherwise
	(TMeta extends XRPCQueryMetadata<any, infer Output, any>
		? Output extends XRPCBlobBodyParam
			? { as: ResponseFormat | null }
			: { as?: ResponseFormat | null }
		: TMeta extends XRPCProcedureMetadata<any, any, infer Output, any>
			? Output extends XRPCBlobBodyParam
				? { as: ResponseFormat | null }
				: { as?: ResponseFormat | null }
			: { as?: ResponseFormat | null }) &
	(TMeta extends XRPCQueryMetadata<infer Params, any, any>
		? // query
			Params extends ObjectSchema
			? { params: InferInput<Params> }
			: { params?: Record<string, unknown> }
		: TMeta extends XRPCProcedureMetadata<infer Params, infer Input, any, any>
			? // procedure
				(Params extends ObjectSchema
					? { params: InferInput<Params> }
					: { params?: Record<string, unknown> }) &
					(Input extends XRPCLexBodyParam
						? { input: InferInput<Input['schema']> }
						: Input extends XRPCBlobBodyParam
							? { input: Blob | ArrayBuffer | ArrayBufferView | ReadableStream }
							: { input?: Record<string, unknown> | Blob | ArrayBuffer | ArrayBufferView | ReadableStream })
			: never);

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
		: TDef extends XRPCQueryMetadata<any, infer Body, any>
			? Body extends XRPCLexBodyParam
				? InferOutput<Body['schema']>
				: null
			: TDef extends XRPCProcedureMetadata<any, any, infer Body, any>
				? Body extends XRPCLexBodyParam
					? InferOutput<Body['schema']>
					: null
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

type UnknownClientResponse = { status: number; headers: Headers } & (
	| { ok: true; data: unknown }
	| { ok: false; data: XRPCErrorPayload }
);

// #endregion

// #region Type definitions for call method
type Namespaced<T> = { mainSchema: T };

// #endregion

// #region Client
/** options for configuring service proxying */
export type ServiceProxyOptions = {
	/** DID identifier that the upstream service should look up */
	did: Did;
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
export class Client<TQueries = XRPCQueries, TProcedures = XRPCProcedures> {
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

	/**
	 * performs an XRPC call with schema validation
	 * @param schema the lexicon schema for the endpoint, or a namespace containing mainSchema
	 * @param options call options
	 */
	call<TMeta extends XRPCQueryMetadata | XRPCProcedureMetadata, TInit extends CallRequestOptions<TMeta>>(
		schema: TMeta | Namespaced<TMeta>,
		...options: HasRequiredKeys<TInit> extends true ? [init: TInit] : [init?: TInit]
	): Promise<ClientResponse<TMeta, TInit>>;

	async call(schema: any, options: any = {}): Promise<any> {
		// early bailout for tree-shaking when schemas aren't used
		if (!v.xrpcSchemaGenerated) {
			return;
		}

		// extract mainSchema if namespace was passed
		if ('mainSchema' in schema) {
			schema = schema.mainSchema;
		}

		if (schema.params !== null) {
			const paramsResult = v.safeParse(schema.params, options.params);
			if (!paramsResult.ok) {
				throw new ClientValidationError('params', paramsResult);
			}
		}

		if (schema.type === 'xrpc_procedure' && schema.input?.type === 'lex') {
			const inputResult = v.safeParse(schema.input.schema, options.input);
			if (!inputResult.ok) {
				throw new ClientValidationError('input', inputResult);
			}
		}

		const isQuery = schema.type === 'xrpc_query';
		const method = isQuery ? 'get' : 'post';

		if (options.as === undefined && schema.output?.type === 'blob') {
			throw new TypeError(`\`as\` option is required for endpoints returning blobs`);
		}

		const format = options.as !== undefined ? options.as : schema.output?.type === 'lex' ? 'json' : null;

		const response = await this.#perform(method, schema.nsid, {
			params: options.params,
			input: isQuery ? undefined : options.input,
			as: format,
			signal: options.signal,
			headers: options.headers,
		});

		if (format === 'json' && response.ok && schema.output?.type === 'lex') {
			const outputResult = v.safeParse(schema.output.schema, response.data);
			if (!outputResult.ok) {
				throw new ClientValidationError('output', outputResult);
			}

			return {
				ok: true,
				status: response.status,
				headers: response.headers,
				data: outputResult.value,
			};
		}

		return response;
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
			headers: _mergeHeaders(headers, {
				'content-type': input && !isWebInput ? 'application/json' : null,
				'atproto-proxy': _constructProxyHeader(this.proxy),
			}),
			duplex: input instanceof ReadableStream ? 'half' : undefined,
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

const _mergeHeaders = (
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
type ExtractSuccessData<R> = R extends { ok: true; data: infer D } ? D : never;

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
	<T extends UnknownClientResponse>(promise: Promise<T>): Promise<ExtractSuccessData<T>>;
	<T extends UnknownClientResponse>(response: T): ExtractSuccessData<T>;
} = (input: Promise<UnknownClientResponse> | UnknownClientResponse): any => {
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

/** represents a validation error during typed calls */
export class ClientValidationError extends Error {
	/** validation target (params, input, or output) */
	readonly target: 'params' | 'input' | 'output';
	/** validation result */
	readonly result: v.Err;

	constructor(target: 'params' | 'input' | 'output', result: v.Err) {
		super(`validation failed for ${target}: ${result.message}`);

		this.name = 'ClientValidationError';
		this.target = target;
		this.result = result;
	}
}

// #endregion
