import type { Nsid } from '../../syntax/nsid.js';

import type { BaseSchema, InferInput, InferOutput } from '../base.js';

import type { LiteralSchema } from './literal.js';
import type { ObjectSchema } from './object.js';
import type { StringSchema } from './string.js';

export type RecordObjectShape = {
	$type: LiteralSchema<Nsid>;
	[key: string]: BaseSchema<any>;
};

export type RecordKeySchema = StringSchema<any, any> | LiteralSchema<string>;
export type RecordObjectSchema = ObjectSchema<RecordObjectShape>;

export interface RecordSchema<TObject extends RecordObjectSchema, TKey extends RecordKeySchema>
	extends BaseSchema<InferInput<TObject>, InferOutput<TObject>> {
	readonly type: 'record';
	readonly key: TKey;
	readonly object: TObject;
}

// #__NO_SIDE_EFFECTS__
export const record = <TKey extends RecordKeySchema, TObject extends RecordObjectSchema>(
	key: TKey,
	object: TObject,
): RecordSchema<TObject, TKey> => {
	return {
		kind: 'schema',
		type: 'record',
		key: key,
		object: object,
		'~run'(input, flags) {
			return object['~run'](input, flags);
		},
	};
};
