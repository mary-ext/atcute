import type { StandardSchemaV1 } from '@standard-schema/spec';

import * as syntax from '../syntax/index.js';

import { _isBytesWrapper } from '../interfaces/bytes.js';
import * as interfaces from '../interfaces/index.js';

import type { $type } from '../types/brand.js';

import { assert } from '../utils.js';

import {
	allowsEval,
	getGraphemeLength,
	getUtf8Length,
	isArray,
	isObject,
	lazy,
	lazyProperty,
} from './utils.js';

type Identity<T> = T;
type Flatten<T> = Identity<{ [K in keyof T]: T[K] }>;

type InputType =
	| 'unknown'
	| 'null'
	| 'undefined'
	| 'string'
	| 'integer'
	| 'boolean'
	| 'blob'
	| 'bytes'
	| 'cid-link'
	| 'object'
	| 'array';

type StringFormatMap = {
	'at-identifier': syntax.ActorIdentifier;
	'at-uri': syntax.ResourceUri;
	cid: syntax.Cid;
	datetime: syntax.Datetime;
	did: syntax.Did;
	handle: syntax.Handle;
	language: syntax.LanguageCode;
	nsid: syntax.Nsid;
	'record-key': syntax.RecordKey;
	tid: syntax.Tid;
	uri: syntax.GenericUri;
};

export type StringFormat = keyof StringFormatMap;

type Literal = string | number | boolean;
type Key = string | number;

type IssueFormatter = () => string;

// #region Schema issue types
export type IssueLeaf = { ok: false; msg: IssueFormatter } & (
	| { code: 'missing_value' }
	| { code: 'invalid_literal'; expected: readonly Literal[] }
	| { code: 'invalid_type'; expected: InputType }
	| { code: 'invalid_variant'; expected: string[] }
	| { code: 'invalid_integer_range'; min: number; max: number }
	| { code: 'invalid_string_format'; expected: StringFormat }
	| { code: 'invalid_string_graphemes'; minGraphemes: number; maxGraphemes: number }
	| { code: 'invalid_string_length'; minLength: number; maxLength: number }
	| { code: 'invalid_array_length'; minLength: number; maxLength: number }
	| { code: 'invalid_bytes_size'; minSize: number; maxSize: number }
);

export type IssueTree =
	| IssueLeaf
	| { ok: false; code: 'prepend'; key: Key; tree: IssueTree }
	| { ok: false; code: 'join'; left: IssueTree; right: IssueTree };

export type Issue =
	| { code: 'missing_value'; path: Key[] }
	| { code: 'invalid_literal'; path: Key[]; expected: readonly Literal[] }
	| { code: 'invalid_type'; path: Key[]; expected: InputType }
	| { code: 'invalid_variant'; path: Key[]; expected: string[] }
	| { code: 'invalid_integer_range'; path: Key[]; min: number; max: number }
	| { code: 'invalid_string_format'; path: Key[]; expected: StringFormat }
	| { code: 'invalid_string_graphemes'; path: Key[]; minGraphemes: number; maxGraphemes: number }
	| { code: 'invalid_string_length'; path: Key[]; minLength: number; maxLength: number }
	| { code: 'invalid_array_length'; path: Key[]; minLength: number; maxLength: number }
	| { code: 'invalid_bytes_size'; path: Key[]; minSize: number; maxSize: number };

// #__NO_SIDE_EFFECTS__
const joinIssues = (left: IssueTree | undefined, right: IssueTree): IssueTree => {
	return left ? { ok: false, code: 'join', left, right } : right;
};

// #__NO_SIDE_EFFECTS__
const prependPath = (key: Key, tree: IssueTree): IssueTree => {
	return { ok: false, code: 'prepend', key, tree };
};

// #region Schema result types

export type Ok<T> = {
	ok: true;
	value: T;
};
export type Err = {
	ok: false;
	readonly message: string;
	readonly issues: readonly Issue[];
	throw(): never;
};

export type ValidationResult<T> = Ok<T> | Err;

// #__NO_SIDE_EFFECTS__
export const ok = <T>(value: T): Ok<T> => {
	return { ok: true, value };
};

// #region Base schema

// Private symbols meant to hold types
declare const kType: unique symbol;
type kType = typeof kType;

// None set
export const FLAG_EMPTY = 0;
// Don't continue validation if an error is encountered
export const FLAG_ABORT_EARLY = 1 << 0;

type MatcherResult = undefined | Ok<unknown> | IssueTree;
type Matcher = (input: unknown, flags: number) => MatcherResult;

type LexStandardSchemaResult<T extends BaseSchema> = StandardSchemaV1.Result<InferOutput<T>>;

interface LexStandardSchema<T extends BaseSchema> extends StandardSchemaV1.Props<unknown> {
	readonly validate: (value: unknown) => LexStandardSchemaResult<T> | Promise<LexStandardSchemaResult<T>>;
	readonly types?: StandardSchemaV1.Types<InferInput<T>, InferOutput<T>>;
}

export interface BaseSchema<TInput = unknown, TOutput = TInput> {
	readonly kind: 'schema';
	readonly type: string;
	readonly '~run': Matcher;
	readonly '~standard': LexStandardSchema<this>;

	readonly [kType]?: { in: TInput; out: TOutput };
}

export type InferInput<T extends BaseSchema> = NonNullable<T[kType]>['in'];

export type InferOutput<T extends BaseSchema> = NonNullable<T[kType]>['out'];

// #region Schema runner
const cloneIssueWithPath = (issue: IssueLeaf, path: Key[]): Issue => {
	const { ok: _ok, msg: _fmt, ...clone } = issue;

	return { ...clone, path };
};

const collectIssues = (tree: IssueTree, path: Key[] = [], issues: Issue[] = []): Issue[] => {
	for (;;) {
		switch (tree.code) {
			case 'join': {
				collectIssues(tree.left, path.slice(), issues);
				tree = tree.right;
				continue;
			}
			case 'prepend': {
				path.push(tree.key);
				tree = tree.tree;
				continue;
			}
			default: {
				issues.push(cloneIssueWithPath(tree, path));
				return issues;
			}
		}
	}
};

const countIssues = (tree: IssueTree): number => {
	let count = 0;
	for (;;) {
		switch (tree.code) {
			case 'join': {
				count += countIssues(tree.left);
				tree = tree.right;
				continue;
			}
			case 'prepend': {
				tree = tree.tree;
				continue;
			}
			default: {
				return count + 1;
			}
		}
	}
};

const separatedList = (list: string[], sep: 'or' | 'and'): string => {
	switch (list.length) {
		case 0: {
			return `nothing`;
		}
		case 1: {
			return list[0];
		}
		default: {
			return `${list.slice(0, -1).join(', ')} ${sep} ${list[list.length - 1]}`;
		}
	}
};

const formatLiteral = (value: Literal): string => {
	return JSON.stringify(value);
};

const formatRangeMessage = (
	type: 'a string' | 'an array' | 'a byte array',
	unit: 'character' | 'grapheme' | 'item' | 'byte',
	min: number,
	max: number,
): string => {
	let message = `expected ${type} `;

	if (min > 0) {
		if (max === min) {
			message += `${min}`;
		} else if (max !== Infinity) {
			message += `between ${min} and ${max}`;
		} else {
			message += `at least ${min}`;
		}
	} else {
		message += `at most ${max}`;
	}

	message += ` ${unit}(s)`;
	return message;
};

const formatIssueTree = (tree: IssueTree): string => {
	let path = '';
	let count = 0;
	for (;;) {
		switch (tree.code) {
			case 'join': {
				count += countIssues(tree.right);
				tree = tree.left;
				continue;
			}
			case 'prepend': {
				path += `.${tree.key}`;
				tree = tree.tree;
				continue;
			}
		}

		break;
	}

	const message = tree.msg();

	let msg = `${tree.code} at ${path || '.'} (${message})`;
	if (count > 0) {
		msg += ` (+${count} other issue(s))`;
	}

	return msg;
};

export class ValidationError extends Error {
	override readonly name = 'ValidationError';

	#issueTree: IssueTree;

	constructor(issueTree: IssueTree) {
		super();

		this.#issueTree = issueTree;
	}

	override get message(): string {
		return formatIssueTree(this.#issueTree);
	}

	get issues(): readonly Issue[] {
		return collectIssues(this.#issueTree);
	}
}

class ErrImpl implements Err {
	readonly ok = false;

	#issueTree: IssueTree;

	constructor(issueTree: IssueTree) {
		this.#issueTree = issueTree;
	}

	get message(): string {
		return formatIssueTree(this.#issueTree);
	}

	get issues(): readonly Issue[] {
		return collectIssues(this.#issueTree);
	}

	throw(): never {
		throw new ValidationError(this.#issueTree);
	}
}

// #__NO_SIDE_EFFECTS__
export const is = <const TSchema extends BaseSchema>(
	schema: TSchema,
	input: unknown,
): input is InferInput<TSchema> => {
	const r = schema['~run'](input, FLAG_ABORT_EARLY);
	return r === undefined || r.ok;
};

// #__NO_SIDE_EFFECTS__
export const safeParse = <const TSchema extends BaseSchema>(
	schema: TSchema,
	input: unknown,
): ValidationResult<InferOutput<TSchema>> => {
	const r = schema['~run'](input, FLAG_EMPTY);

	if (r === undefined) {
		return ok(input as InferOutput<TSchema>);
	}

	if (r.ok) {
		return r as Ok<InferOutput<TSchema>>;
	}

	return new ErrImpl(r);
};

export const parse = <const TSchema extends BaseSchema>(
	schema: TSchema,
	input: unknown,
): InferOutput<TSchema> => {
	const r = schema['~run'](input, FLAG_EMPTY);

	if (r === undefined) {
		return input as InferOutput<TSchema>;
	}

	if (r.ok) {
		return r.value as InferOutput<TSchema>;
	}

	throw new ValidationError(r);
};

// #region Standard Schema support

const collectStandardIssues = (
	tree: IssueTree,
	path: Key[] = [],
	issues: StandardSchemaV1.Issue[] = [],
): StandardSchemaV1.Issue[] => {
	for (;;) {
		switch (tree.code) {
			case 'join': {
				collectStandardIssues(tree.left, path.slice(), issues);
				tree = tree.right;
				continue;
			}
			case 'prepend': {
				path.push(tree.key);
				tree = tree.tree;
				continue;
			}
			default: {
				issues.push({ message: tree.msg(), path: path.length > 0 ? path : undefined });
				return issues;
			}
		}
	}
};

const toStandardSchema = <TSchema extends BaseSchema>(schema: TSchema): LexStandardSchema<TSchema> => {
	return {
		version: 1,
		vendor: '@atcute/lexicons',
		validate(value) {
			const r = schema['~run'](value, FLAG_EMPTY);

			if (r === undefined) {
				return { value: value as InferOutput<TSchema> };
			}

			if (r.ok) {
				return { value: r.value as InferOutput<TSchema> };
			}

			return { issues: collectStandardIssues(r) };
		},
	};
};

// #region Base constraint

export interface BaseConstraint<TType = unknown> {
	readonly kind: 'constraint';
	readonly type: string;
	readonly '~run': (input: TType, flags: number) => MatcherResult;
}

type ConstraintTuple<T> = readonly [BaseConstraint<T>, ...BaseConstraint<T>[]];

export type SchemaWithConstraint<
	TItem extends BaseSchema,
	TConstraints extends ConstraintTuple<InferOutput<TItem>>,
> = TItem & {
	readonly constraints: TConstraints;
};

// #__NO_SIDE_EFFECTS__
export const constrain = <
	TItem extends BaseSchema,
	const TConstraints extends ConstraintTuple<InferOutput<TItem>>,
>(
	base: TItem,
	constraints: TConstraints,
): SchemaWithConstraint<TItem, TConstraints> => {
	const len = constraints.length;

	return {
		...base,
		constraints: constraints,
		'~run'(input, flags) {
			let result = base['~run'](input, flags);
			let current: any;

			if (result === undefined) {
				current = input;
			} else if (result.ok) {
				current = result.value;
			} else {
				return result;
			}

			for (let idx = 0; idx < len; idx++) {
				const r = constraints[idx]['~run'](current, flags);

				if (r !== undefined) {
					if (r.ok) {
						current = r.value;

						if (result === undefined || result.ok) {
							result = r;
						}
					} else {
						if (flags & FLAG_ABORT_EARLY) {
							return r;
						} else if (result === undefined || result.ok) {
							result = r;
						} else {
							result = joinIssues(result, r);
						}
					}
				}
			}

			return result;
		},
	};
};

// #region Base metadata

export interface BaseMetadata {
	readonly kind: 'metadata';
	readonly type: string;
}

// #region Literal schema

export interface LiteralSchema<T extends Literal = Literal> extends BaseSchema<T> {
	readonly type: 'literal';
	readonly expected: T;
}

// #__NO_SIDE_EFFECTS__
export const literal = <T extends Literal>(value: T): LiteralSchema<T> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_literal',
		expected: [value],
		msg() {
			return `expected ${formatLiteral(value)}`;
		},
	};

	return {
		kind: 'schema',
		type: 'literal',
		expected: value,
		'~run'(input, _flags) {
			if (input !== value) {
				return issue;
			}

			return undefined;
		},
		get '~standard'() {
			return lazyProperty(this, '~standard', toStandardSchema(this));
		},
	};
};

export interface LiteralEnumSchema<TEnums extends readonly Literal[] = []>
	extends BaseSchema<TEnums[number]> {
	readonly type: 'literal_enum';
	readonly expected: TEnums;
}

// #__NO_SIDE_EFFECTS__
export const literalEnum = <const TEnums extends readonly Literal[]>(
	values: TEnums,
): LiteralEnumSchema<TEnums> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_literal',
		expected: values,
		msg() {
			return `expected ${separatedList(values.map(formatLiteral), 'or')}`;
		},
	};

	return {
		kind: 'schema',
		type: 'literal_enum',
		expected: values,
		'~run'(input, _flags) {
			if (!values.includes(input as any)) {
				return issue;
			}

			return undefined;
		},
		get '~standard'() {
			return lazyProperty(this, '~standard', toStandardSchema(this));
		},
	};
};

// #region Boolean schema

export interface BooleanSchema extends BaseSchema<boolean> {
	readonly type: 'boolean';
}

const ISSUE_TYPE_BOOLEAN: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'boolean',
	msg() {
		return `expected boolean`;
	},
};

const BOOLEAN_SCHEMA: BooleanSchema = {
	kind: 'schema',
	type: 'boolean',
	'~run'(input, _flags) {
		if (typeof input !== 'boolean') {
			return ISSUE_TYPE_BOOLEAN;
		}

		return undefined;
	},
	get '~standard'() {
		return lazyProperty(this, '~standard', toStandardSchema(this));
	},
};

// #__NO_SIDE_EFFECTS__
export const boolean = (): BooleanSchema => {
	return BOOLEAN_SCHEMA;
};

// #region Integer schema

export interface IntegerSchema extends BaseSchema<number> {
	readonly type: 'integer';
}

const ISSUE_TYPE_INTEGER: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'integer',
	msg() {
		return `expected integer`;
	},
};

const INTEGER_SCHEMA: IntegerSchema = {
	kind: 'schema',
	type: 'integer',
	'~run'(input, _flags) {
		if (typeof input !== 'number') {
			return ISSUE_TYPE_INTEGER;
		}

		if (input < 0 || !Number.isSafeInteger(input)) {
			return ISSUE_TYPE_INTEGER;
		}

		return undefined;
	},
	get '~standard'() {
		return lazyProperty(this, '~standard', toStandardSchema(this));
	},
};

// #__NO_SIDE_EFFECTS__
export const integer = (): IntegerSchema => {
	return INTEGER_SCHEMA;
};

// #region Integer constraints

export interface IntegerRangeConstraint<TMin extends number = number, TMax extends number = number>
	extends BaseConstraint<number> {
	readonly type: 'integer_range';
	readonly min: TMin;
	readonly max: TMax;
}

// #__NO_SIDE_EFFECTS__
export const integerRange: {
	<const TMin extends number>(min: TMin): IntegerRangeConstraint<TMin>;
	<const TMin extends number, const TMax extends number>(
		min: TMin,
		max: TMax,
	): IntegerRangeConstraint<TMin, TMax>;
} = (min: number, max: number = Infinity): IntegerRangeConstraint => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_integer_range',
		min: min,
		max: max,
		msg() {
			let message = `expected an integer `;

			if (min > 0) {
				if (max === min) {
					message += `of exactly ${min}`;
				} else if (max !== Infinity) {
					message += `between ${min} and ${max}`;
				} else {
					message += `of at least ${min}`;
				}
			} else {
				message += `of at most ${max}`;
			}

			return message;
		},
	};

	return {
		kind: 'constraint',
		type: 'integer_range',
		min: min,
		max: max,
		'~run'(input, _flags) {
			if (input < min) {
				return issue;
			}

			if (input > max) {
				return issue;
			}

			return undefined;
		},
	};
};

// #region String schema

export interface StringSchema<T extends string = string> extends BaseSchema<T> {
	readonly type: 'string';
	readonly format: null;
}

export interface FormattedStringSchema<TFormat extends keyof StringFormatMap = keyof StringFormatMap>
	extends BaseSchema<StringFormatMap[TFormat]> {
	readonly type: 'string';
	readonly format: TFormat;
}

const ISSUE_TYPE_STRING: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'string',
	msg() {
		return `expected string`;
	},
};

const STRING_SINGLETON: StringSchema = {
	kind: 'schema',
	type: 'string',
	format: null,
	'~run'(input, _flags) {
		if (typeof input !== 'string') {
			return ISSUE_TYPE_STRING;
		}

		return undefined;
	},
	get '~standard'() {
		return lazyProperty(this, '~standard', toStandardSchema(this));
	},
};

// #__NO_SIDE_EFFECTS__
export const string = <T extends string = string>(): StringSchema<T> => {
	return STRING_SINGLETON as StringSchema<T>;
};

// #__NO_SIDE_EFFECTS__
const _formattedString = <TFormat extends keyof StringFormatMap>(
	format: TFormat,
	validate: (input: string) => boolean,
) => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_string_format',
		expected: format,
		msg() {
			return `expected a ${format} formatted string`;
		},
	};

	const schema: FormattedStringSchema<TFormat> = {
		kind: 'schema',
		type: 'string',
		format: format,
		'~run'(input, _flags) {
			if (typeof input !== 'string') {
				return ISSUE_TYPE_STRING;
			}

			if (!validate(input)) {
				return issue;
			}

			return undefined;
		},
		get '~standard'() {
			return lazyProperty(this, '~standard', toStandardSchema(this));
		},
	};

	return () => schema;
};

// prettier-ignore
export const actorIdentifierString = /*#__PURE__*/ _formattedString('at-identifier', syntax.isActorIdentifier);
export const resourceUriString = /*#__PURE__*/ _formattedString('at-uri', syntax.isResourceUri);
export const cidString = /*#__PURE__*/ _formattedString('cid', syntax.isCid);
export const datetimeString = /*#__PURE__*/ _formattedString('datetime', syntax.isDatetime);
export const didString = /*#__PURE__*/ _formattedString('did', syntax.isDid);
export const handleString = /*#__PURE__*/ _formattedString('handle', syntax.isHandle);
export const languageCodeString = /*#__PURE__*/ _formattedString('language', syntax.isLanguageCode);
export const nsidString = /*#__PURE__*/ _formattedString('nsid', syntax.isNsid);
export const recordKeyString = /*#__PURE__*/ _formattedString('record-key', syntax.isRecordKey);
export const tidString = /*#__PURE__*/ _formattedString('tid', syntax.isTid);
export const genericUriString = /*#__PURE__*/ _formattedString('uri', syntax.isGenericUri);

// #region String constraints

export interface StringLengthConstraint<
	TMinLength extends number = number,
	TMaxLength extends number = number,
> extends BaseConstraint<string> {
	readonly type: 'string_length';
	readonly minLength: TMinLength;
	readonly maxLength: TMaxLength;
}

// #__NO_SIDE_EFFECTS__
export const stringLength: {
	<const TMinLength extends number>(min: TMinLength): StringLengthConstraint<TMinLength>;
	<const TMinLength extends number, const TMaxLength extends number>(
		min: TMinLength,
		max: TMaxLength,
	): StringLengthConstraint<TMinLength, TMaxLength>;
} = (minLength: number, maxLength: number = Infinity): StringLengthConstraint => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_string_length',
		minLength: minLength,
		maxLength: maxLength,
		msg() {
			return formatRangeMessage('a string', 'character', minLength, maxLength);
		},
	};

	return {
		kind: 'constraint',
		type: 'string_length',
		minLength: minLength,
		maxLength: maxLength,
		'~run'(input, _flags) {
			// UTF-8 conversion can be expensive, so we're going to do some safe naive
			// checks where we assume an upper-bound of the UTF-16 to UTF-8 conversion

			const utf16Len = input.length;
			const maybeUtf8Len = utf16Len * 3;

			// fail early if estimated upper bound is too small
			if (maybeUtf8Len < minLength) {
				return issue;
			}

			// skip calculation if UTF-16 length already satisfies both constraints
			if (utf16Len >= minLength && maybeUtf8Len <= maxLength) {
				return undefined;
			}

			const utf8Len = getUtf8Length(input);

			if (utf8Len < minLength) {
				return issue;
			}

			if (utf8Len > maxLength) {
				return issue;
			}

			return undefined;
		},
	};
};

export interface StringGraphemesConstraint<
	TMinGraphemes extends number = number,
	TMaxGraphemes extends number = number,
> extends BaseConstraint<string> {
	readonly type: 'string_graphemes';
	readonly minGraphemes: TMinGraphemes;
	readonly maxGraphemes: TMaxGraphemes;
}

// #__NO_SIDE_EFFECTS__
export const stringGraphemes: {
	<const TMinGraphemes extends number>(min: TMinGraphemes): StringGraphemesConstraint<TMinGraphemes>;
	<const TMinGraphemes extends number, const TMaxGraphemes extends number>(
		min: TMinGraphemes,
		max: TMaxGraphemes,
	): StringGraphemesConstraint<TMinGraphemes, TMaxGraphemes>;
} = (minGraphemes: number, maxGraphemes: number = Infinity): StringGraphemesConstraint => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_string_graphemes',
		minGraphemes: minGraphemes,
		maxGraphemes: maxGraphemes,
		msg() {
			return formatRangeMessage('a string', 'grapheme', minGraphemes, maxGraphemes);
		},
	};

	return {
		kind: 'constraint',
		type: 'string_graphemes',
		minGraphemes: minGraphemes,
		maxGraphemes: maxGraphemes,
		'~run'(input, _flags) {
			// grapheme conversion is expensive, so we're going to do some safe naive
			// checks where we assume 1 UTF-16 character = 1 grapheme.

			const utf16Len = input.length;

			// fail early if UTF-16 length is too small
			if (utf16Len < minGraphemes) {
				return issue;
			}

			// if there is no minimum bounds, we can safely skip when UTF-16 is
			// within the maximum bounds.
			if (minGraphemes === 0 && utf16Len <= maxGraphemes) {
				return undefined;
			}

			const graphemeLen = getGraphemeLength(input);

			if (graphemeLen < minGraphemes) {
				return issue;
			}

			if (graphemeLen > maxGraphemes) {
				return issue;
			}

			return undefined;
		},
	};
};

// #region Blob schema

export interface BlobSchema extends BaseSchema<interfaces.Blob | interfaces.LegacyBlob, interfaces.Blob> {
	readonly type: 'blob';
}

const ISSUE_EXPECTED_BLOB: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'blob',
	msg() {
		return `expected blob`;
	},
};

const BLOB_SCHEMA: BlobSchema = {
	kind: 'schema',
	type: 'blob',
	'~run'(input, _flags) {
		if (typeof input !== 'object' || input === null) {
			return ISSUE_EXPECTED_BLOB;
		}

		if (interfaces.isBlob(input)) {
			return undefined;
		}

		if (interfaces.isLegacyBlob(input)) {
			const blob: interfaces.Blob = {
				$type: 'blob',
				mimeType: input.mimeType,
				ref: { $link: input.cid },
				size: -1,
			};

			return ok(blob);
		}

		return ISSUE_EXPECTED_BLOB;
	},
	get '~standard'() {
		return lazyProperty(this, '~standard', toStandardSchema(this));
	},
};

// #__NO_SIDE_EFFECTS__
export const blob = (): BlobSchema => {
	return BLOB_SCHEMA;
};

// #region IPLD bytes schema

export interface BytesSchema extends BaseSchema<interfaces.Bytes, interfaces.Bytes> {
	readonly type: 'bytes';
}

const ISSUE_EXPECTED_BYTES: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'bytes',
	msg() {
		return `expected bytes`;
	},
};

const BYTES_SCHEMA: BytesSchema = {
	kind: 'schema',
	type: 'bytes',
	'~run'(input, _flags) {
		if (!interfaces.isBytes(input)) {
			return ISSUE_EXPECTED_BYTES;
		}

		return undefined;
	},
	get '~standard'() {
		return lazyProperty(this, '~standard', toStandardSchema(this));
	},
};

// #__NO_SIDE_EFFECTS__
export const bytes = (): BytesSchema => {
	return BYTES_SCHEMA;
};

// #region IPLD bytes constraint
export interface BytesSizeConstraint<TMinLength extends number = number, TMaxLength extends number = number>
	extends BaseConstraint<interfaces.Bytes> {
	readonly type: 'bytes_size';
	readonly minSize: TMinLength;
	readonly maxSize: TMaxLength;
}

// #__NO_SIDE_EFFECTS__
export const bytesSize: {
	<const TMinLength extends number>(min: TMinLength): BytesSizeConstraint<TMinLength>;
	<const TMinLength extends number, const TMaxLength extends number>(
		min: TMinLength,
		max: TMaxLength,
	): BytesSizeConstraint<TMinLength, TMaxLength>;
} = (minSize: number, maxSize: number = Infinity): BytesSizeConstraint => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_bytes_size',
		minSize: minSize,
		maxSize: maxSize,
		msg() {
			return formatRangeMessage('a byte array', 'byte', minSize, maxSize);
		},
	};

	return {
		kind: 'constraint',
		type: 'bytes_size',
		minSize: minSize,
		maxSize: maxSize,
		'~run'(input, _flags) {
			let size: number;

			if (_isBytesWrapper(input)) {
				size = input.buf.length;
			} else {
				const str = input.$bytes;
				let bytes = str.length;

				if (str.charCodeAt(bytes - 1) === 0x3d) {
					bytes--;
				}
				if (bytes > 1 && str.charCodeAt(bytes - 1) === 0x3d) {
					bytes--;
				}

				size = (bytes * 3) >>> 2;
			}

			if (size < minSize) {
				return issue;
			}

			if (size > maxSize) {
				return issue;
			}

			return undefined;
		},
	};
};

// #region IPLD CID type schema

export interface CidLinkSchema extends BaseSchema<interfaces.CidLink, interfaces.CidLink> {
	readonly type: 'cid_link';
}

const ISSUE_EXPECTED_CID_LINK: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'cid-link',
	msg() {
		return `expected cid-link`;
	},
};

const CID_LINK_SCHEMA: CidLinkSchema = {
	kind: 'schema',
	type: 'cid_link',
	'~run'(input, _flags) {
		if (!interfaces.isCidLink(input)) {
			return ISSUE_EXPECTED_CID_LINK;
		}

		return undefined;
	},
	get '~standard'() {
		return lazyProperty(this, '~standard', toStandardSchema(this));
	},
};

// #__NO_SIDE_EFFECTS__
export const cidLink = (): CidLinkSchema => {
	return CID_LINK_SCHEMA;
};

// #region Nullable schema

export interface NullableSchema<TItem extends BaseSchema>
	extends BaseSchema<InferInput<TItem> | null, InferOutput<TItem> | null> {
	readonly type: 'nullable';
	readonly wrapped: TItem;
}

// #__NO_SIDE_EFFECTS__
export const nullable = <TItem extends BaseSchema>(wrapped: TItem): NullableSchema<TItem> => {
	return {
		kind: 'schema',
		type: 'nullable',
		wrapped: wrapped,
		'~run'(input, flags) {
			if (input === null) {
				return undefined;
			}

			return wrapped['~run'](input, flags);
		},
		get '~standard'() {
			return lazyProperty(this, '~standard', toStandardSchema(this));
		},
	};
};

// #region Optional schema

export type DefaultValue<TItem extends BaseSchema> =
	| InferOutput<TItem>
	| (() => InferOutput<TItem>)
	| undefined;

export type InferOptionalOutput<
	TItem extends BaseSchema,
	TDefault extends DefaultValue<TItem>,
> = undefined extends TDefault ? InferOutput<TItem> | undefined : InferOutput<TItem>;

export interface OptionalSchema<
	TItem extends BaseSchema = BaseSchema,
	TDefault extends DefaultValue<TItem> = DefaultValue<TItem>,
> extends BaseSchema<InferInput<TItem> | undefined, InferOptionalOutput<TItem, TDefault>> {
	readonly type: 'optional';
	readonly wrapped: TItem;
	readonly default: TDefault;
}

type MaybeOptional<TItem extends BaseSchema> = TItem | OptionalSchema<TItem, undefined>;

// #__NO_SIDE_EFFECTS__
export const optional: {
	<TItem extends BaseSchema>(wrapped: TItem): OptionalSchema<TItem, undefined>;
	<TItem extends BaseSchema, TDefault extends DefaultValue<TItem>>(
		wrapped: TItem,
		defaultValue: TDefault,
	): OptionalSchema<TItem, TDefault>;
} = (wrapped: BaseSchema, defaultValue?: any): OptionalSchema<any, any> => {
	return {
		kind: 'schema',
		type: 'optional',
		wrapped: wrapped,
		default: defaultValue,
		'~run'(input, flags) {
			if (input === undefined) {
				if (defaultValue === undefined) {
					return undefined;
				}

				const value = typeof defaultValue === 'function' ? defaultValue() : defaultValue;

				return ok(value);
			}

			return wrapped['~run'](input, flags);
		},
		get '~standard'() {
			return lazyProperty(this, '~standard', toStandardSchema(this));
		},
	};
};

const isOptionalSchema = (schema: BaseSchema): schema is OptionalSchema<any, unknown> => {
	return schema.type === 'optional';
};

// #region Array schema

export interface ArraySchema<TItem extends BaseSchema = BaseSchema> extends BaseSchema<unknown[], unknown[]> {
	readonly type: 'array';
	readonly item: TItem;

	readonly [kType]?: { in: InferInput<TItem>[]; out: InferOutput<TItem>[] };
}

const ISSUE_TYPE_ARRAY: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'array',
	msg() {
		return `expected array`;
	},
};

// #__NO_SIDE_EFFECTS__
export const array = <TItem extends BaseSchema>(item: TItem | (() => TItem)): ArraySchema<TItem> => {
	const resolvedShape = lazy(() => {
		return typeof item === 'function' ? item() : item;
	});

	return {
		kind: 'schema',
		type: 'array',
		get item() {
			return lazyProperty(this, 'item', resolvedShape.value);
		},
		get '~run'() {
			const shape = resolvedShape.value;

			const matcher: Matcher = (input, flags) => {
				if (!isArray(input)) {
					return ISSUE_TYPE_ARRAY;
				}

				let issues: IssueTree | undefined;
				let output: any[] | undefined;

				for (let idx = 0, len = input.length; idx < len; idx++) {
					const val = input[idx];
					const r = shape['~run'](val, flags);

					if (r !== undefined) {
						if (r.ok) {
							if (output === undefined) {
								output = input.slice();
							}

							output[idx] = r.value;
						} else {
							issues = joinIssues(issues, prependPath(idx, r));

							if (flags & FLAG_ABORT_EARLY) {
								return issues;
							}
						}
					}
				}

				if (issues !== undefined) {
					return issues;
				}

				if (output !== undefined) {
					return ok(output);
				}

				return undefined;
			};

			return lazyProperty(this, '~run', matcher);
		},
		get '~standard'() {
			return lazyProperty(this, '~standard', toStandardSchema(this));
		},
	};
};

// #region Array constraints

export interface ArrayLengthConstraint<TMinLength extends number = number, TMaxLength extends number = number>
	extends BaseConstraint<unknown[]> {
	readonly type: 'array_length';
	readonly minLength: TMinLength;
	readonly maxLength: TMaxLength;
}

// #__NO_SIDE_EFFECTS__
export const arrayLength: {
	<const TMinLength extends number>(min: TMinLength): ArrayLengthConstraint<TMinLength>;
	<const TMinLength extends number, const TMaxLength extends number>(
		min: TMinLength,
		max: TMaxLength,
	): ArrayLengthConstraint<TMinLength, TMaxLength>;
} = (minLength: number, maxLength: number = Infinity): ArrayLengthConstraint => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_array_length',
		minLength: minLength,
		maxLength: maxLength,
		msg() {
			return formatRangeMessage('an array', 'item', minLength, maxLength);
		},
	};

	return {
		kind: 'constraint',
		type: 'array_length',
		minLength: minLength,
		maxLength: maxLength,
		'~run'(input, _flags) {
			const length = input.length;

			if (length < minLength) {
				return issue;
			}

			if (length > maxLength) {
				return issue;
			}

			return undefined;
		},
	};
};

// #region Object schema

// `ObjectSchema` accepts a `LooseObjectShape` instead of `ObjectShape` to allow
// for circular references, and this means preventing TypeScript from attempting
// to eagerly evaluate the shape, unfortunate that this means we can't throw a
// type issue if you add a non-schema value into the shape though

export type LooseObjectShape = Record<string, any>;
export type ObjectShape = Record<string, BaseSchema>;

export type OptionalObjectInputKeys<TShape extends ObjectShape> = {
	[Key in keyof TShape]: TShape[Key] extends OptionalSchema<any, any> ? Key : never;
}[keyof TShape];

export type OptionalObjectOutputKeys<TShape extends ObjectShape> = {
	[Key in keyof TShape]: TShape[Key] extends OptionalSchema<any, infer Default>
		? undefined extends Default
			? Key
			: never
		: never;
}[keyof TShape];

type InferObjectInput<TShape extends ObjectShape> = Flatten<
	{
		-readonly [Key in keyof TShape as Key extends OptionalObjectInputKeys<TShape> ? never : Key]: InferInput<
			TShape[Key]
		>;
	} & {
		-readonly [Key in keyof TShape as Key extends OptionalObjectInputKeys<TShape> ? Key : never]?: InferInput<
			TShape[Key]
		>;
	}
>;

type InferObjectOutput<TShape extends ObjectShape> = Flatten<
	{
		-readonly [Key in keyof TShape as Key extends OptionalObjectOutputKeys<TShape>
			? never
			: Key]: InferOutput<TShape[Key]>;
	} & {
		-readonly [Key in keyof TShape as Key extends OptionalObjectOutputKeys<TShape>
			? Key
			: never]?: InferOutput<TShape[Key]>;
	}
>;

export interface ObjectSchema<TShape extends LooseObjectShape = LooseObjectShape>
	extends BaseSchema<Record<string, unknown>> {
	readonly type: 'object';
	readonly shape: Readonly<TShape>;

	// passing `InferObjectX` into `extends BaseSchema<...>` eagerly evaluates the
	// shape, however, passing it as a property means that it's only evaluated if
	// you attempt to grab the value.
	readonly [kType]?: { in: InferObjectInput<TShape>; out: InferObjectOutput<TShape> };
}

interface ObjectEntry {
	key: string;
	schema: BaseSchema;
	optional: boolean;
	missing: IssueTree;
}

const ISSUE_TYPE_OBJECT: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'object',
	msg() {
		return `expected object`;
	},
};

const ISSUE_MISSING: IssueLeaf = {
	ok: false,
	code: 'missing_value',
	msg() {
		return `missing value`;
	},
};

const set = (obj: Record<string, unknown>, key: string, value: unknown): void => {
	if (key === '__proto__') {
		Object.defineProperty(obj, key, { value });
	} else {
		obj[key] = value;
	}
};

// #__NO_SIDE_EFFECTS__
export const object = <TShape extends LooseObjectShape>(shape: TShape): ObjectSchema<TShape> => {
	const resolvedEntries = lazy(() => {
		const resolved: ObjectEntry[] = [];

		for (const key in shape) {
			const schema = shape[key];

			resolved.push({
				key: key,
				schema: schema,
				optional: isOptionalSchema(schema),
				missing: prependPath(key, ISSUE_MISSING),
			});
		}

		return resolved;
	});

	return {
		kind: 'schema',
		type: 'object',
		get shape() {
			// if we just return the shape as is then it wouldn't be the same exact
			// shape when getters are present.
			const resolved = resolvedEntries.value;
			const obj: any = {};

			for (const entry of resolved) {
				obj[entry.key] = entry.schema;
			}

			return lazyProperty(this, 'shape', obj as TShape);
		},
		get '~run'() {
			const shape = resolvedEntries.value;
			const len = shape.length;

			const generateFastpass = (): Matcher => {
				const fields: [string, any][] = [
					['$ok', ok],
					['$joinIssues', joinIssues],
					['$prependPath', prependPath],
				];

				let doc = `let $iss,$out;`;

				for (let idx = 0; idx < len; idx++) {
					const entry = shape[idx];

					const key = entry.key;
					const esckey = JSON.stringify(key);

					const id = `_${idx}`;

					doc += `{const $val=$in[${esckey}];`;

					if (entry.optional) {
						doc += `if($val!==undefined){`;
					} else {
						doc += `if($val!==undefined||${esckey} in $in){`;
					}

					doc += `const $res=${id}$schema["~run"]($val,$flags);if($res!==undefined)if($res.ok)${key !== '__proto__' ? `($out??={...$in})[${esckey}]=$res.value` : `Object.defineProperty($out??={...$in},${esckey},{value:$res.value})`};else if((($iss=$joinIssues($iss,$prependPath(${esckey},$res))),$flags&${FLAG_ABORT_EARLY}))return $iss;}`;

					if (entry.optional) {
						const schema = entry.schema as OptionalSchema;
						const innerSchema = schema.wrapped;
						const defaultValue = schema.default;

						fields.push([`${id}$schema`, innerSchema]);

						if (defaultValue !== undefined) {
							const calls = typeof defaultValue === 'function' ? `${id}$default()` : `${id}$default`;

							fields.push([`${id}$default`, defaultValue]);

							doc +=
								key !== '__proto__'
									? `else($out??={...$in})[${esckey}]=${calls};`
									: `else Object.defineProperty($out??={...$in},${esckey},{value:${calls}});`;
						}
					} else {
						fields.push([`${id}$schema`, entry.schema]);
						fields.push([`${id}$missing`, entry.missing]);

						doc += `else if((($iss=$joinIssues($iss,${id}$missing)),$flags&${FLAG_ABORT_EARLY}))return $iss;`;
					}

					doc += `}`;
				}

				doc += `if($iss!==undefined)return $iss;if($out!==undefined)return $ok($out);`;

				const fn = new Function(
					`[${fields.map(([id]) => id).join(',')}]`,
					`return function matcher($in,$flags){${doc}}`,
				);

				return fn(fields.map(([, field]) => field));
			};

			if (allowsEval.value) {
				const fastpass = generateFastpass();

				const matcher: Matcher = (input, flags) => {
					if (!isObject(input)) {
						return ISSUE_TYPE_OBJECT;
					}

					return fastpass(input, flags);
				};

				return lazyProperty(this, '~run', matcher);
			}

			const matcher: Matcher = (input, flags) => {
				if (!isObject(input)) {
					return ISSUE_TYPE_OBJECT;
				}

				let issues: IssueTree | undefined;
				let output: Record<string, unknown> | undefined;

				for (let idx = 0; idx < len; idx++) {
					const entry = shape[idx];

					const key = entry.key;
					const value = input[key];

					if (!entry.optional && value === undefined && !(key in input)) {
						issues = joinIssues(issues, entry.missing);

						if (flags & FLAG_ABORT_EARLY) {
							return issues;
						}

						continue;
					}

					const r = entry.schema['~run'](value, flags);

					if (r !== undefined) {
						if (r.ok) {
							if (output === undefined) {
								output = { ...input };
							}

							/*#__INLINE__*/ set(output, key, r.value);
						} else {
							issues = joinIssues(issues, prependPath(key, r));

							if (flags & FLAG_ABORT_EARLY) {
								return issues;
							}
						}
					}
				}

				if (issues !== undefined) {
					return issues;
				}

				if (output !== undefined) {
					return ok(output);
				}

				return undefined;
			};

			return lazyProperty(this, '~run', matcher);
		},
		get '~standard'() {
			return lazyProperty(this, '~standard', toStandardSchema(this));
		},
	};
};

// #region Record schema
//
// unfortunately, adapting for circular references has meant that we can't have
// TypeScript check the object against a particular shape ($type field required)

export type RecordObjectShape = {
	$type: LiteralSchema<syntax.Nsid>;
	[key: string]: BaseSchema;
};

export type RecordKeySchema = StringSchema | FormattedStringSchema | LiteralSchema<string>;
export type RecordObjectSchema = ObjectSchema<RecordObjectShape>;

export interface RecordSchema<TObject extends ObjectSchema, TKey extends RecordKeySchema>
	extends BaseSchema<Record<string, unknown>> {
	readonly type: 'record';
	readonly key: TKey;
	readonly object: TObject;

	readonly [kType]?: { in: InferInput<TObject>; out: InferOutput<TObject> };
}

// #__NO_SIDE_EFFECTS__
export const record = <TKey extends RecordKeySchema, TObject extends ObjectSchema>(
	key: TKey,
	object: TObject,
): RecordSchema<TObject, TKey> => {
	const validatedObject = lazy((): TObject => {
		const shape = object.shape;

		let t = shape.$type as MaybeOptional<LiteralSchema<syntax.Nsid>> | undefined;

		assert(t !== undefined, `expected $type in record to be defined`);
		if (t.type === 'optional') {
			t = t.wrapped;
		}

		assert(t.type === 'literal' && typeof t.expected === 'string', `expected $type to be a string literal`);

		return object;
	});

	return {
		kind: 'schema',
		type: 'record',
		key: key,
		get object() {
			return lazyProperty(this, 'object', validatedObject.value);
		},
		'~run'(input, flags) {
			return lazyProperty(this, '~run', validatedObject.value['~run'])(input, flags);
		},
		get '~standard'() {
			return lazyProperty(this, '~standard', toStandardSchema(this));
		},
	};
};

// #region Variant schema

type VariantTuple = readonly ObjectSchema<any>[];

type InferVariantInput<TMembers extends VariantTuple> = $type.enforce<InferInput<TMembers[number]>>;

type InferVariantOutput<TMembers extends VariantTuple> = $type.enforce<InferOutput<TMembers[number]>>;

export interface VariantSchema<
	TMembers extends VariantTuple = VariantTuple,
	TClosed extends boolean = boolean,
> extends BaseSchema<Record<string, unknown>> {
	readonly type: 'variant';
	readonly members: TMembers;
	readonly closed: TClosed;

	readonly [kType]?: { in: InferVariantInput<TMembers>; out: InferVariantOutput<TMembers> };
}

const ISSUE_VARIANT_MISSING = /*#__PURE__*/ prependPath('$type', ISSUE_MISSING);

const ISSUE_VARIANT_TYPE = /*#__PURE__*/ prependPath('$type', ISSUE_TYPE_STRING);

// #__NO_SIDE_EFFECTS__
export const variant: {
	<const TMembers extends VariantTuple>(members: TMembers): VariantSchema<TMembers>;
	<const TMembers extends VariantTuple, TClosed extends boolean>(
		members: TMembers,
		closed: TClosed,
	): VariantSchema<TMembers, TClosed>;
} = (members: ObjectSchema[], closed: boolean = false): VariantSchema<any, any> => {
	return {
		kind: 'schema',
		type: 'variant',
		members: members,
		closed: closed,
		get '~run'() {
			const map = Object.fromEntries(
				members.map((member, idx) => {
					const shape = member.shape;

					let t = shape.$type as MaybeOptional<LiteralSchema<syntax.Nsid>> | undefined;

					assert(t !== undefined, `expected $type in variant member #${idx} to be defined`);
					if (t.type === 'optional') {
						t = t.wrapped;
					}

					assert(
						t.type === 'literal' && typeof t.expected === 'string',
						`expected $type in variant member #${idx} to be a string literal`,
					);

					return [t.expected, member];
				}),
			);

			const issue: IssueLeaf = {
				ok: false,
				code: 'invalid_variant',
				expected: Object.keys(map),
				msg() {
					return `expected ${separatedList(Object.keys(map), 'or')}`;
				},
			};

			const matcher: Matcher = (input, flags) => {
				if (!isObject(input)) {
					return ISSUE_TYPE_OBJECT;
				}

				const type = input.$type;

				if (type === undefined && !('$type' in input)) {
					return ISSUE_VARIANT_MISSING;
				}

				if (typeof type !== 'string') {
					return closed ? issue : ISSUE_VARIANT_TYPE;
				}

				const schema = map[type];

				if (schema === undefined) {
					if (closed) {
						return issue;
					}

					return undefined;
				}

				return schema['~run'](input, flags);
			};

			return lazyProperty(this, '~run', matcher);
		},
		get '~standard'() {
			return lazyProperty(this, '~standard', toStandardSchema(this));
		},
	};
};

// #region Unknown schema

export interface UnknownSchema extends BaseSchema<Record<string, unknown>> {
	readonly type: 'unknown';
}

const ISSUE_TYPE_UNKNOWN: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'unknown',
	msg() {
		return `expected unknown`;
	},
};

const UNKNOWN_SCHEMA: UnknownSchema = {
	kind: 'schema',
	type: 'unknown',
	'~run'(input, _flags) {
		if (typeof input !== 'object' || input === null) {
			return ISSUE_TYPE_UNKNOWN;
		}

		return undefined;
	},
	get '~standard'() {
		return lazyProperty(this, '~standard', toStandardSchema(this));
	},
};

// #__NO_SIDE_EFFECTS__
export const unknown = (): UnknownSchema => {
	return UNKNOWN_SCHEMA;
};

// #region XRPC types

export interface XRPCLexBodyParam<
	TSchema extends ObjectSchema | VariantSchema = ObjectSchema | VariantSchema,
> {
	readonly type: 'lex';
	readonly schema: TSchema;
}

export interface XRPCBlobBodyParam {
	readonly type: 'blob';
	readonly encoding?: string[];
}

export type XRPCBodyParam = XRPCLexBodyParam | XRPCBlobBodyParam | null;

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

// #region XRPC procedure metadata

export interface XRPCProcedureMetadata<
	TParams extends ObjectSchema | null = ObjectSchema | null,
	TInput extends XRPCBodyParam = XRPCBodyParam,
	TOutput extends XRPCBodyParam = XRPCBodyParam,
	TNsid extends syntax.Nsid = syntax.Nsid,
> extends BaseMetadata {
	readonly type: 'xrpc_procedure';
	readonly nsid: TNsid;
	readonly params: TParams;
	readonly input: TInput;
	readonly output: TOutput;
}

// #__NO_SIDE_EFFECTS__
export const procedure = <
	TNsid extends syntax.Nsid,
	TParams extends ObjectSchema | null,
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

	return {
		kind: 'metadata',
		type: 'xrpc_procedure',
		nsid: nsid,
		params: options.params,
		get input() {
			let val = options.input;

			switch (val?.type) {
				case 'lex': {
					val = {
						type: 'lex',
						schema: val.schema,
					} as TInput;
					break;
				}
			}

			return lazyProperty(this, 'input', val);
		},
		get output() {
			let val = options.output;

			switch (val?.type) {
				case 'lex': {
					val = {
						type: 'lex',
						schema: val.schema,
					} as TOutput;
					break;
				}
			}

			return lazyProperty(this, 'output', val);
		},
	};
};

// #region XRPC query metadata

export interface XRPCQueryMetadata<
	TParams extends ObjectSchema | null = ObjectSchema | null,
	TOutput extends XRPCBodyParam = XRPCBodyParam,
	TNsid extends syntax.Nsid = syntax.Nsid,
> extends BaseMetadata {
	readonly type: 'xrpc_query';
	readonly nsid: TNsid;
	readonly params: TParams;
	readonly output: TOutput;
}

// #__NO_SIDE_EFFECTS__
export const query = <
	TNsid extends syntax.Nsid,
	TParams extends ObjectSchema | null,
	TOutput extends XRPCBodyParam,
>(
	nsid: TNsid,
	options: {
		params: TParams;
		output: TOutput;
	},
): XRPCQueryMetadata<TParams, TOutput, TNsid> => {
	// `schema` can be a getter, and we'd have to resolve that getter.

	return {
		kind: 'metadata',
		type: 'xrpc_query',
		nsid: nsid,
		params: options.params,
		get output() {
			let val = options.output;

			switch (val?.type) {
				case 'lex': {
					val = {
						type: 'lex',
						schema: val.schema,
					} as TOutput;
				}
			}

			return lazyProperty(this, 'output', val);
		},
	};
};

// #region XRPC subscription metadata

export interface XRPCSubscriptionMetadata<
	TParams extends ObjectSchema | null = ObjectSchema | null,
	TMessage extends ObjectSchema<any> | VariantSchema<any, any> | null =
		| ObjectSchema<any>
		| VariantSchema<any, any>
		| null,
	TNsid extends syntax.Nsid = syntax.Nsid,
> extends BaseMetadata {
	readonly type: 'xrpc_subscription';
	readonly nsid: TNsid;
	readonly params: TParams;
	readonly message: TMessage;
}

// #__NO_SIDE_EFFECTS__
export const subscription = <
	TNsid extends syntax.Nsid,
	TParams extends ObjectSchema | null,
	TMessage extends ObjectSchema<any> | VariantSchema<any, any> | null,
>(
	nsid: TNsid,
	options: {
		params: TParams;
		readonly message: TMessage;
	},
): XRPCSubscriptionMetadata<TParams, TMessage, TNsid> => {
	// `message` can be a getter, and we'd have to resolve that getter.

	return {
		kind: 'metadata',
		type: 'xrpc_subscription',
		nsid: nsid,
		params: options.params,
		get message() {
			return lazyProperty(this, 'message', options.message);
		},
	};
};
