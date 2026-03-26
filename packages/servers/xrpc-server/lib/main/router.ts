import {
	safeParse,
	type XRPCProcedureMetadata,
	type XRPCQueryMetadata,
	type XRPCSubscriptionMetadata,
} from '@atcute/lexicons/validations';

import type { Literal, Promisable } from '../types/misc.ts';

import type {
	ProcedureConfig,
	QueryConfig,
	SubscriptionConfig,
	UnknownOperationContext,
	UnknownSubscriptionContext,
} from './types/operation.ts';
import type { WebSocketAdapter } from './types/websocket.ts';
import { encodeErrorFrame, encodeMessageFrame, extractMessageType, omitMessageType } from './utils/frames.ts';
import { createAsyncMiddlewareRunner, type Middleware } from './utils/middlewares.ts';
import { unwrapLxm, type Namespaced } from './utils/namespaced.ts';
import { constructMimeValidator, hasRequestBody } from './utils/request-input.ts';
import { constructParamsHandler } from './utils/request-params.ts';
import { invalidRequest, validationError } from './utils/response.ts';
import { XRPCError, XRPCSubscriptionError } from './xrpc-error.ts';

type InternalRequestContext = {
	url: URL;
	request: Request;
};

type InternalRequestHandler = (context: InternalRequestContext) => Promise<Response>;

type InternalRouteData = {
	method: 'GET' | 'POST';
	handler: InternalRequestHandler;
};

export type FetchMiddleware = Middleware<[request: Request], Promise<Response>>;

export type NotFoundHandler = (request: Request) => Promisable<Response>;
export type ExceptionHandler = (error: unknown, request: Request) => Promisable<Response>;
export type SubscriptionExceptionHandler = (error: unknown, request: Request) => void;

export const defaultExceptionHandler: ExceptionHandler = (error: unknown) => {
	if (error instanceof XRPCError) {
		return error.toResponse();
	}

	if (error instanceof Response) {
		return error;
	}

	return Response.json(
		{ error: 'InternalServerError', message: `an exception happened whilst processing this request` },
		{ status: 500 },
	);
};

export const defaultNotFoundHandler: NotFoundHandler = () => {
	return new Response('Not Found', { status: 404 });
};

export const defaultSubscriptionExceptionHandler: SubscriptionExceptionHandler = (error: unknown) => {
	throw error;
};

export interface XRPCRouterOptions {
	middlewares?: FetchMiddleware[];
	handleNotFound?: NotFoundHandler;
	handleException?: ExceptionHandler;
	handleSubscriptionException?: SubscriptionExceptionHandler;
	websocket?: WebSocketAdapter;
}

export class XRPCRouter {
	#handlers: Record<string, InternalRouteData> = {};
	#handleNotFound: NotFoundHandler;
	#handleException: ExceptionHandler;
	#handleSubscriptionException: SubscriptionExceptionHandler;
	#websocket?: WebSocketAdapter;

	fetch: (request: Request) => Promise<Response>;

	constructor({
		middlewares = [],
		handleException = defaultExceptionHandler,
		handleNotFound = defaultNotFoundHandler,
		handleSubscriptionException = defaultSubscriptionExceptionHandler,
		websocket,
	}: XRPCRouterOptions = {}) {
		const runner = createAsyncMiddlewareRunner([...middlewares, (request) => this.#dispatch(request)]);

		this.fetch = (request) => runner(request);
		this.#handleException = handleException;
		this.#handleNotFound = handleNotFound;
		this.#handleSubscriptionException = handleSubscriptionException;
		this.#websocket = websocket;
	}

	async #dispatch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const pathname = url.pathname;

		if (!pathname.startsWith('/xrpc/')) {
			return this.#handleNotFound(request);
		}

		const nsid = pathname.slice('/xrpc/'.length);

		const route = this.#handlers[nsid];
		if (route === undefined) {
			return this.#handleNotFound(request);
		}

		if (request.method !== route.method) {
			return Response.json(
				{ error: 'InvalidHttpMethod', message: `invalid http method (expected ${route.method})` },
				{ status: 405, headers: { allow: `${route.method}` } },
			);
		}

		try {
			const response = await route.handler({
				request: request,
				url: url,
			});

			return response;
		} catch (err) {
			if (request.signal.aborted) {
				return new Response(null, { status: 499 });
			}

			return this.#handleException(err, request);
		}
	}

	/** @deprecated use `addQuery` and `addProcedure` instead */
	add<TQuery extends XRPCQueryMetadata>(
		query: TQuery | Namespaced<TQuery>,
		config: QueryConfig<TQuery>,
	): void;
	add<TProcedure extends XRPCProcedureMetadata>(
		procedure: TProcedure | Namespaced<TProcedure>,
		config: ProcedureConfig<TProcedure>,
	): void;
	add(
		operation:
			| XRPCQueryMetadata
			| XRPCProcedureMetadata
			| Namespaced<XRPCQueryMetadata | XRPCProcedureMetadata>,
		config: any,
	): void {
		const schema = unwrapLxm(operation);

		switch (schema.type) {
			case 'xrpc_query': {
				return this.addQuery(schema, config);
			}
			case 'xrpc_procedure': {
				return this.addProcedure(schema, config);
			}
		}
	}

	addQuery<TQuery extends XRPCQueryMetadata, TConfig extends QueryConfig<TQuery>>(
		query: TQuery | Namespaced<TQuery>,
		config: TConfig,
	): void {
		const querySchema = unwrapLxm(query);
		const handleParams = querySchema.params ? constructParamsHandler(querySchema.params) : null;

		const handler = config.handler;

		this.#handlers[querySchema.nsid] = {
			method: 'GET',
			handler: async ({ request, url }) => {
				let params: Record<string, Literal | Literal[]>;

				if (handleParams !== null) {
					const result = handleParams(url.searchParams);
					if (!result.ok) {
						return validationError('params', result);
					}

					params = result.value;
				} else {
					params = {};
				}

				const context: UnknownOperationContext = {
					request: request,
					signal: request.signal,
					params: params,
				};

				const output = await handler(context as any);

				if (output instanceof Response) {
					return output;
				}

				return new Response(null);
			},
		};
	}

	addProcedure<TProcedure extends XRPCProcedureMetadata, TConfig extends ProcedureConfig<TProcedure>>(
		procedure: TProcedure | Namespaced<TProcedure>,
		config: TConfig,
	): void {
		const procedureSchema = unwrapLxm(procedure);
		const handleParams = procedureSchema.params ? constructParamsHandler(procedureSchema.params) : null;
		const validateInputType = procedureSchema.input ? constructMimeValidator(procedureSchema.input) : null;

		const requiresInput = procedureSchema.input !== null;
		const inputSchema = procedureSchema.input?.type === 'lex' ? procedureSchema.input.schema : null;

		const handler = config.handler;

		this.#handlers[procedureSchema.nsid] = {
			method: 'POST',
			handler: async ({ request, url }) => {
				let params: Record<string, Literal | Literal[]>;
				let input: Record<string, unknown> | undefined;

				if (handleParams !== null) {
					const result = handleParams(url.searchParams);
					if (!result.ok) {
						return validationError('params', result);
					}

					params = result.value;
				} else {
					params = {};
				}

				if (requiresInput) {
					if (!hasRequestBody(request)) {
						return invalidRequest(`request body is expected but none was provided`);
					}

					if (validateInputType !== null) {
						const result = validateInputType(request);
						if (!result.ok) {
							return invalidRequest(result.error);
						}
					}

					if (inputSchema !== null) {
						let raw: any;
						try {
							raw = await request.json();
						} catch {
							return invalidRequest(`invalid request body (failed to parse json)`);
						}

						const result = safeParse(inputSchema, raw);
						if (!result.ok) {
							return validationError('input', result);
						}

						input = result.value;
					}
				} else {
					if (hasRequestBody(request)) {
						return invalidRequest(`request body is provided when none was expected`);
					}
				}

				const context: UnknownOperationContext = {
					request: request,
					signal: request.signal,
					params: params,
					input: input,
				};

				const output = await handler(context as any);

				if (output instanceof Response) {
					return output;
				}

				return new Response(null);
			},
		};
	}

	addSubscription<
		TSubscription extends XRPCSubscriptionMetadata,
		TConfig extends SubscriptionConfig<TSubscription>,
	>(subscription: TSubscription | Namespaced<TSubscription>, config: TConfig): void {
		const websocket = this.#websocket;
		if (websocket === undefined) {
			throw new Error(`WebSocket adapter not configured`);
		}

		const subscriptionSchema = unwrapLxm(subscription);
		const nsid = subscriptionSchema.nsid;

		const handleParams = subscriptionSchema.params ? constructParamsHandler(subscriptionSchema.params) : null;
		const handler = config.handler;

		this.#handlers[nsid] = {
			method: 'GET',
			handler: async ({ request, url }) => {
				{
					const con = request.headers.get('connection');
					const req = request.headers.get('upgrade');
					if (
						con === null ||
						req === null ||
						con.toLowerCase() !== 'upgrade' ||
						req.toLowerCase() !== 'websocket'
					) {
						return invalidRequest(`invalid WebSocket upgrade`);
					}
				}

				let params: Record<string, Literal | Literal[]>;

				if (handleParams !== null) {
					const result = handleParams(url.searchParams);
					if (!result.ok) {
						return validationError('params', result);
					}

					params = result.value;
				} else {
					params = {};
				}

				const upgrade = await websocket.upgrade(request, async (ws) => {
					const signal = ws.signal;

					const context: UnknownSubscriptionContext = {
						request: request,
						params: params,
						signal: signal,
					};

					try {
						for await (const message of handler(context)) {
							if (signal.aborted) {
								break;
							}

							const type = extractMessageType(message, nsid);
							const body = omitMessageType(message);

							const frame = encodeMessageFrame(body, type);
							await ws.send(frame);
						}

						ws.close(1000);
					} catch (err) {
						if (err instanceof XRPCSubscriptionError) {
							const frame = encodeErrorFrame(err.error, err.description);

							try {
								await ws.send(frame);
							} catch {
								// best-effort, socket may already be closed
							}

							ws.close(err.closeCode, err.error);
							return;
						}

						ws.close(1011, `internal server error`);
						this.#handleSubscriptionException(err, request);
					}
				});

				if (upgrade !== undefined) {
					return upgrade;
				}

				return invalidRequest(`WebSocket upgrade failed`);
			},
		};
	}
}
