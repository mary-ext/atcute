import type { Nsid } from '../../syntax/nsid.js';
import type { $type } from '../../types/brand.js';

import { prependPath, type BaseSchema, type InferInput, type InferOutput, type IssueLeaf } from '../base.js';
import type { OptionalSchema } from '../misc.js';
import { isObject } from '../utils.js';

import type { LiteralSchema } from './literal.js';
import type { ObjectSchema } from './object.js';

export type VariantObjectShape = {
	$type: LiteralSchema<Nsid> | OptionalSchema<LiteralSchema<Nsid>, undefined>;
	[key: string]: BaseSchema<any>;
};

export type VariantObjectSchema = ObjectSchema<VariantObjectShape>;

type VariantTuple = readonly [VariantObjectSchema, ...VariantObjectSchema[]];

export type InferVariantInput<TMembers extends VariantTuple> = $type.enforce<InferInput<TMembers[number]>>;

export type InferVariantOutput<TMembers extends VariantTuple> = $type.enforce<InferOutput<TMembers[number]>>;

export interface VariantSchema<TMembers extends VariantTuple, TClosed extends boolean = false>
	extends BaseSchema<InferVariantInput<TMembers>, InferVariantOutput<TMembers>> {
	readonly type: 'variant';
	readonly members: TMembers;
	readonly closed: TClosed;
}

const ISSUE_TYPE_OBJECT: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'object',
};

const ISSUE_VARIANT_MISSING = prependPath('$type', {
	ok: false,
	code: 'missing_value',
});

const ISSUE_VARIANT_TYPE = prependPath('$type', {
	ok: false,
	code: 'invalid_type',
	expected: 'string',
});

// #__NO_SIDE_EFFECTS__
export const variant: {
	<TMembers extends VariantTuple>(members: TMembers): VariantSchema<TMembers>;
	<TMembers extends VariantTuple, TClosed extends boolean>(
		members: TMembers,
		closed: TClosed,
	): VariantSchema<TMembers, TClosed>;
} = (members: VariantObjectSchema[], closed: boolean = false): VariantSchema<any, any> => {
	const map = Object.fromEntries(
		members.map((schema) => {
			const nsidType = schema.shape.$type;
			const nsid = nsidType.type === 'optional' ? nsidType.wrapped.expected : nsidType.expected;

			return [nsid, schema];
		}),
	);

	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_variant',
		expected: Object.keys(map),
	};

	return {
		kind: 'schema',
		type: 'variant',
		members: members,
		closed: closed,
		'~run'(input, flags) {
			if (!isObject(input)) {
				return ISSUE_TYPE_OBJECT;
			}

			if (!('$type' in input)) {
				return ISSUE_VARIANT_MISSING;
			}

			const type = input.$type;

			if (typeof type !== 'string') {
				return ISSUE_VARIANT_TYPE;
			}

			if (!(type in map)) {
				if (closed) {
					return issue;
				}

				return undefined;
			}

			const schema = map[type];

			return schema['~run'](input, flags);
		},
	};
};
