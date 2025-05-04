import type { Nsid } from '../../syntax/nsid.js';

import type { BaseMetadata } from '../base.js';
import type { ObjectSchema } from '../schemas/object.js';
import type { XRPCBodyParam, XRPCParametersShape } from '../types/xrpc.js';

export interface XRPCProcedureMetadata<
	TParams extends ObjectSchema<XRPCParametersShape> | null,
	TInput extends XRPCBodyParam,
	TOutput extends XRPCBodyParam,
	TNsid extends Nsid,
> extends BaseMetadata {
	readonly type: 'xrpc_procedure';
	readonly nsid: TNsid;
	readonly params: TParams;
	readonly input: TInput;
	readonly output: TOutput;
}

export const xrpcProcedure = <
	TNsid extends Nsid,
	TParams extends ObjectSchema<XRPCParametersShape> | null,
	TInput extends XRPCBodyParam,
	TOutput extends XRPCBodyParam,
>(
	nsid: TNsid,
	options: {
		params: TParams;
		input: TInput;
		output: TOutput;
	},
): XRPCProcedureMetadata<TParams, TInput, TOutput, TNsid> => {
	return {
		kind: 'metadata',
		type: 'xrpc_procedure',
		nsid: nsid,
		params: options.params,
		input: options.input,
		output: options.output,
	};
};
