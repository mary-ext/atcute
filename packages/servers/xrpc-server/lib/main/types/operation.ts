import type {
	InferOutput,
	ObjectSchema,
	VariantSchema,
	XRPCBlobBodyParam,
	XRPCLexBodyParam,
	XRPCProcedureMetadata,
	XRPCQueryMetadata,
	XRPCSubscriptionMetadata,
} from '@atcute/lexicons/validations';

import type { Literal, Promisable } from '../../types/misc.ts';
import type { JSONResponse } from '../response.ts';

export type UnknownOperationContext = {
	request: Request;
	signal: AbortSignal;
	params: Record<string, Literal | Literal[]>;
	input?: Record<string, unknown>;
};

// #region Query

export type QueryContext<TQuery extends XRPCQueryMetadata> = {
	request: Request;
	signal: AbortSignal;
} & (TQuery['params'] extends ObjectSchema
	? {
			params: InferOutput<TQuery['params']>;
		}
	: {
			// params
		});

export type QueryHandler<TQuery extends XRPCQueryMetadata> = (
	context: QueryContext<TQuery>,
) => Promisable<
	TQuery['output'] extends null
		? Response | void
		: TQuery['output'] extends XRPCLexBodyParam
			? Response | JSONResponse<InferOutput<TQuery['output']['schema']>>
			: Response
>;

export type QueryConfig<TQuery extends XRPCQueryMetadata = XRPCQueryMetadata> = {
	handler: QueryHandler<TQuery>;
};

// #region Procedure

export type ProcedureContext<TProcedure extends XRPCProcedureMetadata> = {
	signal: AbortSignal;
} & (TProcedure['input'] extends XRPCBlobBodyParam
	? {
			request: Request & { readonly body: ReadableStream<Uint8Array> };
		}
	: TProcedure['input'] extends XRPCLexBodyParam
		? {
				request: Request & { readonly body: null };
			}
		: {
				request: Request;
			}) &
	(TProcedure['params'] extends ObjectSchema
		? {
				params: InferOutput<TProcedure['params']>;
			}
		: {
				// params
			}) &
	(TProcedure['input'] extends XRPCLexBodyParam
		? {
				input: InferOutput<TProcedure['input']['schema']>;
			}
		: {
				// input
			});

export type ProcedureHandler<TProcedure extends XRPCProcedureMetadata> = (
	context: ProcedureContext<TProcedure>,
) => Promisable<
	TProcedure['output'] extends null
		? Response | void
		: TProcedure['output'] extends XRPCLexBodyParam
			? Response | JSONResponse<InferOutput<TProcedure['output']['schema']>>
			: Response
>;

export type ProcedureConfig<TProcedure extends XRPCProcedureMetadata = XRPCProcedureMetadata> = {
	handler: ProcedureHandler<TProcedure>;
};

// #region Subscription

export interface UnknownSubscriptionContext {
	request: Request;
	signal: AbortSignal;
	params: Record<string, Literal | Literal[]>;
}

export type SubscriptionContext<TSubscription extends XRPCSubscriptionMetadata> = {
	request: Request;
	signal: AbortSignal;
} & (TSubscription['params'] extends ObjectSchema
	? {
			params: InferOutput<TSubscription['params']>;
		}
	: {
			// params
		});

export type SubscriptionHandler<TSubscription extends XRPCSubscriptionMetadata> = (
	context: SubscriptionContext<TSubscription>,
) => AsyncIterable<
	TSubscription['message'] extends ObjectSchema | VariantSchema<any>
		? InferOutput<TSubscription['message']>
		: never
>;

export type SubscriptionConfig<TSubscription extends XRPCSubscriptionMetadata = XRPCSubscriptionMetadata> = {
	handler: SubscriptionHandler<TSubscription>;
};
