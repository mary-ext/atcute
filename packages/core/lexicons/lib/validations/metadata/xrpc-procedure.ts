import type { Nsid } from '../../syntax/nsid.js';

import type { BaseMetadata } from '../base.js';
import type { ObjectSchema } from '../schemas/object.js';
import type { XRPCBodyParam, XRPCParametersShape } from '../types/xrpc.js';
import { lazy } from '../utils.js';

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

// #__NO_SIDE_EFFECTS__
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
	// `schema` can be a getter, and we'd have to resolve that getter.
	const input = lazy((): TInput => {
		const val = options.input;

		switch (val?.type) {
			case 'lex': {
				return {
					type: 'lex',
					schema: val.schema,
				} as TInput;
			}
		}

		return val;
	});

	const output = lazy((): TOutput => {
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
		type: 'xrpc_procedure',
		nsid: nsid,
		params: options.params,
		get input() {
			return input.value;
		},
		get output() {
			return output.value;
		},
	};
};
