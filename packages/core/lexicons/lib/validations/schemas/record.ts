import type { Nsid } from '../../syntax/nsid.js';

import {
	FLAG_ABORT_EARLY,
	joinIssues,
	prependPath,
	type BaseSchema,
	type InferInput,
	type InferOutput,
	type IssueLeaf,
	type IssueTree,
} from '../base.js';
import { type OptionalSchema } from '../misc.js';
import { isObject, lazy } from '../utils.js';
import type { StringSchema } from './string.js';

type Identity<T> = T;
type Flatten<T> = Identity<{ [K in keyof T]: T[K] }>;

export type RecordShape = Record<string, BaseSchema<any>>;

export type OptionalRecordInputKeys<TShape extends RecordShape> = {
	[Key in keyof TShape]: TShape[Key] extends OptionalSchema<any, any> ? Key : never;
}[keyof TShape];

export type OptionalRecordOutputKeys<TShape extends RecordShape> = {
	[Key in keyof TShape]: TShape[Key] extends OptionalSchema<any, infer Default>
		? undefined extends Default
			? Key
			: never
		: never;
}[keyof TShape];

export type InferRecordInput<TShape extends RecordShape, TNsid extends Nsid> = Flatten<
	{
		$type: TNsid;
	} & {
		-readonly [Key in Exclude<keyof TShape, OptionalRecordInputKeys<TShape>>]: InferInput<TShape[Key]>;
	} & {
		-readonly [Key in OptionalRecordInputKeys<TShape>]?: InferInput<TShape[Key]>;
	}
>;

export type InferRecordOutput<TShape extends RecordShape, TNsid extends Nsid> = Flatten<
	{
		$type: TNsid;
	} & {
		-readonly [Key in Exclude<keyof TShape, OptionalRecordOutputKeys<TShape>>]: InferOutput<TShape[Key]>;
	} & {
		-readonly [Key in OptionalRecordOutputKeys<TShape>]?: InferOutput<TShape[Key]>;
	}
>;

export interface RecordSchema<TKey extends StringSchema, TShape extends RecordShape, TNsid extends Nsid>
	extends BaseSchema<InferRecordInput<TShape, TNsid>, InferRecordOutput<TShape, TNsid>> {
	readonly type: 'record';
	readonly nsid: TNsid;
	readonly key: TKey;
	readonly shape: Readonly<TShape>;
}

interface RecordEntry {
	key: string;
	schema: BaseSchema<any>;
	optional: boolean;
	missing: IssueTree;
}

const ISSUE_TYPE_RECORD: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'record',
};

const ISSUE_MISSING: IssueLeaf = {
	ok: false,
	code: 'missing_value',
};

// #__NO_SIDE_EFFECTS__
export const record = <TNsid extends Nsid, TKey extends StringSchema, TShape extends RecordShape>(
	nsid: TNsid,
	key: TKey,
	shape: TShape,
): RecordSchema<TKey, TShape, TNsid> => {
	const resolvedEntries = lazy(() => {
		const array: RecordEntry[] = [];

		for (const key in shape) {
			const schema = shape[key];

			array.push({
				key: key,
				schema: schema,
				optional: isOptionalSchema(schema),
				missing: prependPath(key, ISSUE_MISSING),
			});
		}

		return array;
	});

	// if we just return the shape as is then it wouldn't be the same exact
	// shape when getters are present.
	const introspect = lazy(() => {
		const obj: any = {};

		for (const entry of resolvedEntries.value) {
			obj[entry.key] = entry.schema;
		}

		return obj as TShape;
	});

	const typeIssue = prependPath('$type', {
		ok: false,
		code: 'invalid_literal',
		expected: [nsid],
	});

	return {
		kind: 'schema',
		type: 'record',
		nsid: nsid,
		key: key,
		get shape() {
			return introspect.value;
		},
		'~run'(input, flags) {
			if (!isObject(input)) {
				return ISSUE_TYPE_RECORD;
			}

			const type = input.$type;
			if (type !== nsid) {
				return typeIssue;
			}

			const entries = resolvedEntries.value;

			let issues: IssueTree | undefined;
			let output: Record<string, unknown> | undefined;

			for (let idx = 0, len = entries.length; idx < len; idx++) {
				const entry = entries[idx];

				const key = entry.key;
				const value = input[key];

				if (value === undefined && !(key in input)) {
					if (!entry.optional) {
						issues = joinIssues(issues, entry.missing);

						if (flags & FLAG_ABORT_EARLY) {
							return issues;
						}

						continue;
					}
				}

				const r = entry.schema['~run'](value, flags);

				if (r === undefined) {
					if (output !== undefined) {
						output[key] = value;
					}
				} else if (r.ok) {
					if (output === undefined) {
						output = { ...input };
					}

					output[key] = r.value;
				} else {
					issues = joinIssues(issues, prependPath(key, r));

					if (flags & FLAG_ABORT_EARLY) {
						return issues;
					}
				}
			}

			if (issues !== undefined) {
				return issues;
			}

			if (output !== undefined) {
				return { ok: true, value: output };
			}

			return undefined;
		},
	};
};

const isOptionalSchema = (schema: BaseSchema<any>): schema is OptionalSchema<any, unknown> => {
	return schema.type === 'optional';
};
