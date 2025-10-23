import {
	safeParse,
	type XRPCProcedureMetadata,
	type XRPCQueryMetadata,
	type XRPCSubscriptionMetadata,
} from '@atcute/lexicons/validations';

import type { Literal, Promisable } from '../types/misc.js';

import type {
	ProcedureConfig,
	QueryConfig,
	SubscriptionConfig,
	UnknownOperationContext,
	UnknownSubscriptionContext,
} from './types/operation.js';
import type { WebSocketAdapter } from './types/websocket.js';
import { encodeErrorFrame, encodeMessageFrame, extractMessageType, omitMessageType } from './utils/frames.js';
import { createAsyncMiddlewareRunner, type Middleware } from './utils/middlewares.js';
import { constructMimeValidator } from './utils/request-input.js';
import { constructParamsHandler } from './utils/request-params.js';
import { invalidRequest, validationError } from './utils/response.js';
import { XRPCError, XRPCSubscriptionError } from './xrpc-error.js';

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

export interface XRPCRouterOptions {
	middlewares?: FetchMiddleware[];
	handleNotFound?: NotFoundHandler;
	handleException?: ExceptionHandler;
	websocket?: WebSocketAdapter;
}

export class XRPCRouter {
	#handlers: Record<string, InternalRouteData> = {};
	#handleNotFound: NotFoundHandler;
	#handleException: ExceptionHandler;
	#websocket?: WebSocketAdapter;

	fetch: (request: Request) => Promise<Response>;

	constructor({
		middlewares = [],
		handleException = defaultExceptionHandler,
		handleNotFound = defaultNotFoundHandler,
		websocket,
	}: XRPCRouterOptions = {}) {
		const runner = createAsyncMiddlewareRunner([...middlewares, (request) => this.#dispatch(request)]);

		this.fetch = (request) => runner(request);
		this.#handleException = handleException;
		this.#handleNotFound = handleNotFound;
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
			return this.#handleException(err, request);
		}
	}

	add<TQuery extends XRPCQueryMetadata>(query: TQuery, config: QueryConfig<TQuery>): void;
	add<TProcedure extends XRPCProcedureMetadata>(
		procedure: TProcedure,
		config: ProcedureConfig<TProcedure>,
	): void;
	add<TSubscription extends XRPCSubscriptionMetadata>(
		subscription: TSubscription,
		config: SubscriptionConfig<TSubscription>,
	): void;
	add(operation: XRPCQueryMetadata | XRPCProcedureMetadata | XRPCSubscriptionMetadata, config: any): void {
		switch (operation.type) {
			case 'xrpc_query': {
				return this.#addQuery(operation, config);
			}
			case 'xrpc_procedure': {
				return this.#addProcedure(operation, config);
			}
			case 'xrpc_subscription': {
				return this.#addSubscription(operation, config);
			}
		}
	}

	#addQuery<TQuery extends XRPCQueryMetadata>(query: TQuery, config: QueryConfig<TQuery>): void {
		const handleParams = query.params ? constructParamsHandler(query.params) : null;

		const handler = config.handler;

		this.#handlers[query.nsid] = {
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

	#addProcedure<TProcedure extends XRPCProcedureMetadata>(
		procedure: TProcedure,
		config: ProcedureConfig<TProcedure>,
	): void {
		const handleParams = procedure.params ? constructParamsHandler(procedure.params) : null;
		const validateInputType = procedure.input ? constructMimeValidator(procedure.input) : null;

		const requiresInput = procedure.input !== null;
		const inputSchema = procedure.input?.type === 'lex' ? procedure.input.schema : null;

		const handler = config.handler;

		this.#handlers[procedure.nsid] = {
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
					if (request.body === null) {
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
						} catch (err) {
							return invalidRequest(`invalid request body (failed to parse json)`);
						}

						const result = safeParse(inputSchema, raw);
						if (!result.ok) {
							return validationError('input', result);
						}

						input = result.value;
					}
				} else {
					if (request.body !== null) {
						return invalidRequest(`request body is provided when none was expected`);
					}
				}

				const context: UnknownOperationContext = {
					request: request,
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
	>(subscription: TSubscription, config: TConfig): void {
		const websocket = this.#websocket;
		if (websocket === undefined) {
			throw new Error(`WebSocket adapter not configured`);
		}

		const nsid = subscription.nsid;

		const handleParams = subscription.params ? constructParamsHandler(subscription.params) : null;
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
					const context: UnknownSubscriptionContext = {
						request: request,
						params: params,
						signal: ws.signal,
					};

					try {
						for await (const message of handler(context)) {
							if (ws.signal.aborted) {
								break;
							}

							const type = extractMessageType(message, nsid);
							const body = omitMessageType(message);

							const frame = encodeMessageFrame(body, type);
							await ws.send(frame);
						}
					} catch (err) {
						if (err instanceof XRPCSubscriptionError) {
							const frame = encodeErrorFrame(err.error, err.description);

							try {
								await ws.send(frame);
							} catch {}

							ws.close(err.closeCode, err.error);
							return;
						}

						ws.close(1011, `internal server error`);
						throw err;
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
