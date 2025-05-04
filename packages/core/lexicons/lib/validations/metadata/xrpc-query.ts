import type { Nsid } from '../../syntax/nsid.js';

import type { BaseMetadata } from '../base.js';
import type { ObjectSchema } from '../schemas/object.js';
import type { XRPCBodyParam, XRPCParametersShape } from '../types/xrpc.js';

export interface XRPCQueryMetadata<
	TParams extends ObjectSchema<XRPCParametersShape> | null,
	TOutput extends XRPCBodyParam,
	TNsid extends Nsid,
> extends BaseMetadata {
	readonly type: 'xrpc_query';
	readonly nsid: TNsid;
	readonly params: TParams;
	readonly output: TOutput;
}

export const xrpcQuery = <
	TNsid extends Nsid,
	TParams extends ObjectSchema<XRPCParametersShape> | null,
	TOutput extends XRPCBodyParam,
>(
	nsid: TNsid,
	options: {
		params: TParams;
		output: TOutput;
	},
): XRPCQueryMetadata<TParams, TOutput, TNsid> => {
	return {
		kind: 'metadata',
		type: 'xrpc_query',
		nsid: nsid,
		params: options.params,
		output: options.output,
	};
};
