import type { XRPCProcedureMetadata, XRPCQueryMetadata } from '@atcute/lexicons/validations';

import { XRPCRouter, type XRPCRouterOptions } from './router.ts';
import type { ProcedureConfig, QueryConfig } from './types/operation.ts';
import { type Namespaced, unwrapLxm } from './utils/namespaced.ts';

type XrpcHandlerRouterOptions = Pick<XRPCRouterOptions, 'middlewares' | 'handleNotFound' | 'handleException'>;

export type XrpcQueryHandlerOptions<TQuery extends XRPCQueryMetadata> = {
	lxm: TQuery | Namespaced<TQuery>;
	routerOptions?: XrpcHandlerRouterOptions;
} & QueryConfig<TQuery>;

export type XrpcProcedureHandlerOptions<TProcedure extends XRPCProcedureMetadata> = {
	lxm: TProcedure | Namespaced<TProcedure>;
	routerOptions?: XrpcHandlerRouterOptions;
} & ProcedureConfig<TProcedure>;

export type XrpcHandlerOptions =
	| XrpcQueryHandlerOptions<XRPCQueryMetadata>
	| XrpcProcedureHandlerOptions<XRPCProcedureMetadata>;

/**
 * create a fetch handler for a single xrpc query or procedure. requests are expected at `/xrpc/<nsid>`.
 * subscriptions are not supported.
 */
export function createXrpcHandler<TQuery extends XRPCQueryMetadata>(
	options: XrpcQueryHandlerOptions<TQuery>,
): (request: Request) => Promise<Response>;
export function createXrpcHandler<TProcedure extends XRPCProcedureMetadata>(
	options: XrpcProcedureHandlerOptions<TProcedure>,
): (request: Request) => Promise<Response>;
export function createXrpcHandler(options: XrpcHandlerOptions): (request: Request) => Promise<Response> {
	const { lxm, handler, routerOptions } = options;

	const router = new XRPCRouter(routerOptions);

	const schema = unwrapLxm(lxm);

	switch (schema.type) {
		case 'xrpc_query': {
			router.addQuery(schema, { handler: handler as QueryConfig<XRPCQueryMetadata>['handler'] });
			break;
		}
		case 'xrpc_procedure': {
			router.addProcedure(schema, { handler: handler as ProcedureConfig<XRPCProcedureMetadata>['handler'] });
			break;
		}
	}

	return router.fetch;
}
