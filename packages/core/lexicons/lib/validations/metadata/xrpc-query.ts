import type { Nsid } from '../../syntax/nsid.js';

import type { BaseMetadata } from '../base.js';
import type { ObjectSchema } from '../schemas/object.js';
import type { XRPCBodyParam, XRPCParametersShape } from '../types/xrpc.js';
import { lazy } from '../utils.js';

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

// #__NO_SIDE_EFFECTS__
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
	// `schema` can be a getter, and we'd have to resolve that getter.
	const output = lazy(() => {
		const val = options.output;

		switch (val?.type) {
			case 'lex': {
				return {
					type: 'lex',
					schema: val.schema,
				} as TOutput;
			}
		}

		return val;
	});

	return {
		kind: 'metadata',
		type: 'xrpc_query',
		nsid: nsid,
		params: options.params,
		get output() {
			return output.value;
		},
	};
};
