declare const bType: unique symbol;
type bType = typeof bType;

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

export type StringFormat =
	| 'at-identifier'
	| 'at-uri'
	| 'cid'
	| 'datetime'
	| 'did'
	| 'handle'
	| 'language'
	| 'nsid'
	| 'record-key'
	| 'tid'
	| 'uri';

export type Literal = string | number | boolean;
export type Key = string | number;

export type IssueLeaf =
	| { ok: false; code: 'missing_value' }
	| { ok: false; code: 'invalid_literal'; expected: Literal[] }
	| { ok: false; code: 'invalid_type'; expected: InputType }
	| { ok: false; code: 'invalid_variant'; expected: string[] }
	| { ok: false; code: 'invalid_integer_range'; min: number; max: number }
	| { ok: false; code: 'invalid_string_format'; expected: StringFormat }
	| { ok: false; code: 'invalid_string_graphemes'; minGraphemes: number; maxGraphemes: number }
	| { ok: false; code: 'invalid_string_length'; minLength: number; maxLength: number }
	| { ok: false; code: 'invalid_array_length'; minLength: number; maxLength: number }
	| { ok: false; code: 'invalid_bytes_size'; minSize: number; maxSize: number };

export type IssueTree =
	| IssueLeaf
	| { ok: false; code: 'prepend'; key: Key; tree: IssueTree }
	| { ok: false; code: 'join'; left: IssueTree; right: IssueTree };

export type Issue =
	| { code: 'missing_value'; path: Key[] }
	| { code: 'invalid_literal'; path: Key[]; expected: Literal[] }
	| { code: 'invalid_type'; path: Key[]; expected: InputType }
	| { code: 'invalid_variant'; path: Key[]; expected: string[] }
	| { code: 'invalid_integer_range'; path: Key[]; min: number; max: number }
	| { code: 'invalid_string_format'; path: Key[]; expected: StringFormat }
	| { code: 'invalid_string_graphemes'; path: Key[]; minGraphemes: number; maxGraphemes: number }
	| { code: 'invalid_string_length'; path: Key[]; minLength: number; maxLength: number }
	| { code: 'invalid_array_length'; path: Key[]; minLength: number; maxLength: number }
	| { code: 'invalid_bytes_size'; path: Key[]; minSize: number; maxSize: number };

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

type MatcherResult = undefined | Ok<unknown> | IssueTree;

export interface BaseSchema<TInput, TOutput = TInput> {
	readonly kind: 'schema';
	readonly type: string;
	readonly '~run': (input: unknown, flags: number) => MatcherResult;

	readonly [bType]?: {
		input: TInput;
		output: TOutput;
	};
}

export interface BaseConstraint<TInput, TOutput = TInput> {
	readonly kind: 'constraint';
	readonly type: string;
	readonly '~run': (input: TInput, flags: number) => MatcherResult;

	readonly [bType]?: {
		input: TInput;
		output: TOutput;
	};
}

export interface BaseMetadata {
	readonly kind: 'metadata';
	readonly type: string;
}

export type InferInput<T extends BaseSchema<any> | BaseConstraint<any>> = NonNullable<T[bType]>['input'];
export type InferOutput<T extends BaseSchema<any> | BaseConstraint<any>> = NonNullable<T[bType]>['output'];

export type SchemaWithPipe<
	TPipe extends readonly [BaseSchema<unknown, unknown>, ...BaseConstraint<any, unknown>[]],
> = Omit<FirstTupleItem<TPipe>, bType> & {
	readonly pipe: TPipe;

	readonly [bType]?: {
		input: InferInput<FirstTupleItem<TPipe>>;
		output: InferOutput<LastTupleItem<TPipe>>;
	};
};

// None set
export const FLAG_EMPTY = 0;
// Don't continue validation if an error is encountered
export const FLAG_ABORT_EARLY = 1 << 0;

export const joinIssues = (left: IssueTree | undefined, right: IssueTree): IssueTree => {
	return left ? { ok: false, code: 'join', left, right } : right;
};

export const prependPath = (key: Key, tree: IssueTree): IssueTree => {
	return { ok: false, code: 'prepend', key, tree };
};

type FirstTupleItem<TTuple extends readonly [unknown, ...unknown[]]> = TTuple[0];

type LastTupleItem<TTuple extends readonly [unknown, ...unknown[]]> = TTuple[TTuple extends readonly [
	unknown,
	...infer TRest,
]
	? TRest['length']
	: never];
