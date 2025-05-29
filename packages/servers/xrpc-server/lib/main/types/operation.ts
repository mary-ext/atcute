import type {
	InferOutput,
	ObjectSchema,
	XRPCBlobBodyParam,
	XRPCLexBodyParam,
	XRPCProcedureMetadata,
	XRPCQueryMetadata,
} from '@atcute/lexicons/validations';

import type { Literal, Promisable } from '../../types/misc.js';

import type { JSONResponse } from '../response.js';

export type UnknownOperationContext = {
	request: Request;
	params: Record<string, Literal | Literal[]>;
	input?: Record<string, unknown>;
};

// #region Query

export type QueryContext<TQuery extends XRPCQueryMetadata> = {
	request: Request;
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

export type ProcedureContext<TProcedure extends XRPCProcedureMetadata> =
	(TProcedure['input'] extends XRPCBlobBodyParam
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
