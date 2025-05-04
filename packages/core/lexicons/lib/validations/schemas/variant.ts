import type { Nsid } from '../../syntax/nsid.js';
import type { $type } from '../../types/brand.js';

import { prependPath, type BaseSchema, type InferInput, type InferOutput, type IssueLeaf } from '../base.js';
import { isObject } from '../utils.js';

import type { ObjectSchema, ObjectShape } from './object.js';
import type { RecordSchema, RecordShape } from './record.js';
import type { StringSchema } from './string.js';

type Member = ObjectSchema<ObjectShape, Nsid> | RecordSchema<StringSchema, RecordShape, Nsid>;
type MemberTuple = readonly [Member, ...Member[]];

export type InferVariantInput<TMembers extends MemberTuple> = $type.enforce<InferInput<TMembers[number]>>;

export type InferVariantOutput<TMembers extends MemberTuple> = $type.enforce<InferOutput<TMembers[number]>>;

export interface VariantSchema<TMembers extends MemberTuple, TClosed extends boolean = false>
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
	<TMembers extends MemberTuple>(members: TMembers): VariantSchema<TMembers>;
	<TMembers extends MemberTuple, TClosed extends boolean>(
		members: TMembers,
		closed: TClosed,
	): VariantSchema<TMembers, TClosed>;
} = (members: Member[], closed: boolean = false): VariantSchema<any, any> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_variant',
		expected: members.map((schema) => schema.nsid),
	};

	const map = Object.fromEntries(members.map((schema) => [schema.nsid, schema]));

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
