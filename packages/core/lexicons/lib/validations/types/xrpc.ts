import type { Nsid } from '../../syntax/nsid.js';
import type { BaseSchema, InferInput, InferOutput, Literal } from '../base.js';

import type { ObjectSchema } from '../schemas/object.js';
import type { VariantSchema } from '../schemas/variant.js';

export interface XRPCLexBodyParam<TSchema extends ObjectSchema<any, Nsid | null> | VariantSchema<any, any>> {
	type: 'lex';
	schema: TSchema;
}

export interface XRPCBlobBodyParam {
	type: 'blob';
}

export type XRPCBodyParam = XRPCLexBodyParam<any> | XRPCBlobBodyParam | null;

export type XRPCParametersShape = Record<string, BaseSchema<Literal | Literal[] | undefined>>;

export type InferXRPCBodyInput<T extends XRPCBodyParam> =
	T extends XRPCLexBodyParam<infer Schema>
		? InferInput<Schema>
		: T extends XRPCBlobBodyParam
			? Blob
			: T extends null
				? void
				: never;

export type InferXRPCBodyOutput<T extends XRPCBodyParam> =
	T extends XRPCLexBodyParam<infer Schema>
		? InferOutput<Schema>
		: T extends XRPCBlobBodyParam
			? Blob
			: T extends null
				? void
				: never;
