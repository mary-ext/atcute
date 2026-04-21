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
export type HealthCheckHandler = (request: Request) => Promisable<Response>;
export type ExceptionHandler = (error: unknown, request: Request) => Promisable<Response>;

/** telemetry hook invoked for unexpected HTTP handler errors; fire-and-forget. */
export type ErrorObserver = (ctx: { error: unknown; request: Request }) => void;
/** telemetry hook invoked for unexpected subscription errors; fire-and-forget. */
export type SocketErrorObserver = (ctx: { error: unknown; request: Request }) => void;

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
	/**
	 * optional handler for `/xrpc/_health`. when provided, the router answers
	 * health-check requests by invoking this handler; when absent, the path
	 * falls through to `handleNotFound`. `_health` is not part of the atproto
	 * XRPC spec, so callers opt in explicitly.
	 */
	handleHealthCheck?: HealthCheckHandler;
	/** translates a thrown error into an HTTP response. */
	handleException?: ExceptionHandler;
	/**
	 * fire-and-forget telemetry hook for unexpected HTTP errors. not invoked for
	 * client-induced errors (aborted requests, `XRPCError` subclasses, thrown
	 * `Response` objects).
	 */
	onError?: ErrorObserver;
	/**
	 * fire-and-forget telemetry hook for unexpected subscription errors. not
	 * invoked for aborted signals or `XRPCSubscriptionError` (which is
	 * translated to an error frame).
	 */
	onSocketError?: SocketErrorObserver;
	websocket?: WebSocketAdapter;
}

export class XRPCRouter {
	#handlers: Record<string, InternalRouteData> = {};
	#handleNotFound: NotFoundHandler;
	#handleHealthCheck?: HealthCheckHandler;
	#handleException: ExceptionHandler;
	#onError?: ErrorObserver;
	#onSocketError?: SocketErrorObserver;
	#websocket?: WebSocketAdapter;

	fetch: (request: Request) => Promise<Response>;

	constructor({
		middlewares = [],
		handleException = defaultExceptionHandler,
		handleNotFound = defaultNotFoundHandler,
		handleHealthCheck,
		onError,
		onSocketError,
		websocket,
	}: XRPCRouterOptions = {}) {
		const runner = createAsyncMiddlewareRunner([...middlewares, (request) => this.#dispatch(request)]);

		this.fetch = (request) => runner(request);
		this.#handleException = handleException;
		this.#handleNotFound = handleNotFound;
		this.#handleHealthCheck = handleHealthCheck;
		this.#onError = onError;
		this.#onSocketError = onSocketError;
		this.#websocket = websocket;
	}

	#observeError(error: unknown, request: Request): void {
		// client-induced errors are not bugs; skip telemetry
		if (request.signal.aborted) return;
		if (error instanceof XRPCError) return;
		if (error instanceof Response) return;

		try {
			this.#onError?.({ error, request });
		} catch {
			// observer threw; swallow to keep response path deterministic
		}
	}

	#observeSocketError(error: unknown, request: Request): void {
		if (request.signal.aborted) return;
		if (error instanceof XRPCSubscriptionError) return;

		try {
			this.#onSocketError?.({ error, request });
		} catch {
			// observer threw; swallow to keep socket close path deterministic
		}
	}

	async #dispatch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const pathname = url.pathname;

		if (!pathname.startsWith('/xrpc/')) {
			return this.#handleNotFound(request);
		}

		const nsid = pathname.slice('/xrpc/'.length);

		if (nsid === '_health' && this.#handleHealthCheck !== undefined) {
			try {
				return await this.#handleHealthCheck(request);
			} catch (err) {
				if (request.signal.aborted) {
					return new Response(null, { status: 499 });
				}

				this.#observeError(err, request);
				return this.#handleException(err, request);
			}
		}

		const route = this.#handlers[nsid];
		if (route === undefined) {
			return this.#handleNotFound(request);
		}

		// allow HEAD alongside GET; the runtime is responsible for stripping the
		// response body per the Fetch API.
		const allowed = request.method === route.method || (route.method === 'GET' && request.method === 'HEAD');
		if (!allowed) {
			return Response.json(
				{ error: 'InvalidRequest', message: `invalid http method (expected ${route.method})` },
				{ status: 405, headers: { allow: route.method === 'GET' ? 'GET, HEAD' : route.method } },
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

			this.#observeError(err, request);
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
							const frame = encodeErrorFrame(err.error, err.message || undefined);

							try {
								await ws.send(frame);
							} catch {
								// best-effort, socket may already be closed
							}

							ws.close(err.closeCode, err.error);
							return;
						}

						ws.close(1011, `internal server error`);
						this.#observeSocketError(err, request);
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
