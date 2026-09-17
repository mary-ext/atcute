// oxlint-disable typescript/no-explicit-any

import type { CodeFragment, CodeTag, LocalIdent } from '@oomfware/eval';

import { isBlob } from '../interfaces/blob.ts';

import {
	type ArrayLengthConstraint,
	type ArraySchema,
	type BaseConstraint,
	type BaseSchema,
	FLAG_ABORT_EARLY,
	FLAG_DISCARD_ISSUES,
	FLAG_INTERPRET,
	FLAG_STRICT,
	type IntegerRangeConstraint,
	type IssueLeaf,
	type LiteralEnumSchema,
	type LiteralSchema,
	type NullableSchema,
	type ObjectSchema,
	type OptionalSchema,
	type RecordSchema,
	type StringSchema,
	type VariantSchema,
	ok,
} from './index.ts';
import { codegen, isArray, isObject, lazy, setCompiler } from './utils.ts';

// compiled validation returns a value or INVALID; the interpreter builds issues on failure.
const INVALID = Symbol();

// returned in place of the interpreter's issues when the caller discards them
const ISSUE_INVALID: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'unknown',
	msg() {
		return `invalid value`;
	},
};

type Code = CodeFragment | LocalIdent;
type Compiled = (input: unknown) => unknown;
type ConstrainedSchema = BaseSchema & { readonly constraints: readonly BaseConstraint<any>[] };
type Matcher = BaseSchema['~run'];

// compiled wrappers don't count as matcher overrides when inspecting derived schemas.
const compiledMatchers = new WeakSet<Matcher>();

class UnsupportedError extends Error {}

interface Context {
	/** flags passed to matchers called from generated code */
	flags: number;
	/** inlined container schemas currently being emitted, for cycle detection */
	stack: Set<BaseSchema>;
	strict: boolean;
}

/** shared reference to a lazily generated validator */
type Unit = ReturnType<typeof lazy<Compiled>>;

interface Output {
	/** expression indicating a transform, even if the value is unchanged */
	changed: Code;
	value: Code;
}

interface Emitted {
	/** validation code; returns INVALID on failure */
	code: CodeFragment;
	/** null if the schema never transforms its input */
	output: Output | null;
}

// #region codegen helpers

// initialized by `enableCompilation()` before installing the compiler
let x: CodeTag;

const reject = (cond: CodeFragment): CodeFragment => {
	return x`if(${cond})return ${INVALID};`;
};

const unchanged = (code: CodeFragment): Emitted => {
	return { code: code, output: null };
};

const adopt = (inner: Output | null, res: LocalIdent, changed: LocalIdent): CodeFragment => {
	if (inner === null) {
		return x.empty;
	}

	return x`if(${inner.changed}){${res}=${inner.value};${changed}=true;}`;
};

// #endregion

// #region schema emitters

/**
 * emits validation code for `acc`.
 *
 * @throws {UnsupportedError} if the schema can't be emitted
 */
const emit = (ctx: Context, schema: BaseSchema, acc: Code): Emitted => {
	const proto = Object.getPrototypeOf(schema) as BaseSchema;

	// derived schemas can reuse prototype code unless they override the matcher.
	if (proto !== Object.prototype) {
		if (Object.hasOwn(schema, 'constraints')) {
			return emitConstrained(ctx, schema as ConstrainedSchema, proto, acc);
		}

		const own = Object.getOwnPropertyDescriptor(schema, '~run');
		if (own === undefined || compiledMatchers.has(own.value)) {
			return emit(ctx, proto, acc);
		}

		throw new UnsupportedError();
	}

	switch (schema.type) {
		case 'array': {
			return withContainer(ctx, schema, () => emitArray(ctx, schema as ArraySchema, acc));
		}
		case 'blob': {
			if (!ctx.strict) {
				// legacy blobs get converted, leave that to the schema
				return emitIsland(ctx, schema, acc);
			}

			return unchanged(reject(x`!${isBlob}(${acc})`));
		}
		case 'boolean': {
			return unchanged(reject(x`typeof ${acc}!=='boolean'`));
		}
		case 'bytes':
		case 'cid_link': {
			return unchanged(emitCheck(ctx, schema, acc));
		}
		case 'integer': {
			return unchanged(reject(x`!Number.isSafeInteger(${acc})`));
		}
		case 'literal': {
			const expected = (schema as LiteralSchema).expected;
			return unchanged(reject(x`${acc}!==${expected}`));
		}
		case 'literal_enum': {
			const expected = (schema as LiteralEnumSchema<any>).expected as readonly unknown[];

			if (expected.length <= 4 && !expected.some((v) => Number.isNaN(v))) {
				let cond = x`true`;
				for (const value of expected) {
					cond = x`${cond}&&${acc}!==${value}`;
				}

				return unchanged(reject(cond));
			}

			return unchanged(reject(x`!${new Set(expected)}.has(${acc})`));
		}
		case 'nullable': {
			const wrapped = (schema as NullableSchema).wrapped;
			return emitUnless(ctx, wrapped, acc, { skip: x`null` });
		}
		case 'object': {
			const unit = getUnit(schema, ctx.strict);
			const res = x.local();

			return {
				code: x`const ${res}=${unit}.value(${acc});if(${res}===${INVALID})return ${INVALID};`,
				output: { changed: x`${res}!==${acc}`, value: res },
			};
		}
		case 'optional': {
			const { wrapped, default: defaultValue } = schema as OptionalSchema;

			let fallback: CodeFragment | undefined;
			if (typeof defaultValue === 'function') {
				fallback = x`${defaultValue}()`;
			} else if (defaultValue !== undefined) {
				fallback = x`${defaultValue}`;
			}

			return emitUnless(ctx, wrapped, acc, { fallback: fallback, skip: x`undefined` });
		}
		case 'record': {
			// the `object` getter asserts the object's `$type`
			return emitChild(ctx, (schema as RecordSchema<ObjectSchema, any>).object, acc);
		}
		case 'string': {
			if ((schema as StringSchema).format === null) {
				return unchanged(reject(x`typeof ${acc}!=='string'`));
			}

			return unchanged(emitCheck(ctx, schema, acc));
		}
		case 'unknown': {
			return unchanged(reject(x`typeof ${acc}!=='object'||${acc}===null`));
		}
		case 'variant': {
			return withContainer(ctx, schema, () => emitVariant(ctx, schema as VariantSchema, acc));
		}
	}

	throw new UnsupportedError();
};

/** emits a schema, falling back to calling its matcher if it can't be emitted */
const emitChild = (ctx: Context, schema: BaseSchema, acc: Code): Emitted => {
	try {
		return emit(ctx, schema, acc);
	} catch (err) {
		if (!(err instanceof UnsupportedError)) {
			throw err;
		}

		return emitIsland(ctx, schema, acc);
	}
};

const emitIsland = (ctx: Context, schema: BaseSchema, acc: Code): Emitted => {
	const r = x.local();
	const res = x.local();
	const changed = x.local();

	return {
		code: x`const ${r}=${schema}['~run'](${acc},${ctx.flags});let ${res}=${acc},${changed}=false;if(${r}!==undefined){if(!${r}.ok)return ${INVALID};${res}=${r}.value;${changed}=true;}`,
		output: { changed: changed, value: res },
	};
};

/** calls the matcher of a built-in schema or constraint that never transforms its input */
const emitCheck = (ctx: Context, target: BaseSchema | BaseConstraint<any>, acc: Code): CodeFragment => {
	return reject(x`${target}['~run'](${acc},${ctx.flags})!==undefined`);
};

const emitConstrained = (ctx: Context, schema: ConstrainedSchema, base: BaseSchema, acc: Code): Emitted => {
	const { code, output } = emit(ctx, base, acc);
	const cur = output?.value ?? acc;

	let checks = code;

	for (const constraint of schema.constraints) {
		switch (constraint.type) {
			case 'array_length': {
				const { minLength, maxLength } = constraint as ArrayLengthConstraint;
				checks = x`${checks}${reject(x`${cur}.length<${minLength}||${cur}.length>${maxLength}`)}`;
				break;
			}
			case 'blob_accept':
			case 'blob_size': {
				// both are no-ops outside of strict mode
				if (ctx.strict) {
					checks = x`${checks}${emitCheck(ctx, constraint, cur)}`;
				}
				break;
			}
			case 'bytes_size':
			case 'string_graphemes':
			case 'string_length': {
				checks = x`${checks}${emitCheck(ctx, constraint, cur)}`;
				break;
			}
			case 'integer_range': {
				const { min, max } = constraint as IntegerRangeConstraint;
				checks = x`${checks}${reject(x`${cur}<${min}||${cur}>${max}`)}`;
				break;
			}
			default: {
				throw new UnsupportedError();
			}
		}
	}

	return { code: checks, output: output };
};

interface UnlessOptions {
	/** replacement expression, evaluated only when the input matches `skip` */
	fallback?: CodeFragment;
	/** value that bypasses validation */
	skip: CodeFragment;
}

const emitUnless = (
	ctx: Context,
	wrapped: BaseSchema,
	acc: Code,
	{ fallback, skip }: UnlessOptions,
): Emitted => {
	const inner = emitChild(ctx, wrapped, acc);

	if (inner.output === null && fallback === undefined) {
		return unchanged(x`if(${acc}!==${skip}){${inner.code}}`);
	}

	const res = x.local();
	const changed = x.local();

	let otherwise = x.empty;
	if (fallback !== undefined) {
		otherwise = x`else{${res}=${fallback};${changed}=true;}`;
	}

	return {
		code: x`let ${res}=${acc},${changed}=false;if(${acc}!==${skip}){${inner.code}${adopt(inner.output, res, changed)}}${otherwise}`,
		output: { changed: changed, value: res },
	};
};

const withContainer = <T>(ctx: Context, schema: BaseSchema, fn: () => T): T => {
	// objects recurse through shared functions; inlined arrays and variants need cycle detection.
	if (ctx.stack.has(schema)) {
		throw new UnsupportedError();
	}

	ctx.stack.add(schema);
	try {
		return fn();
	} finally {
		ctx.stack.delete(schema);
	}
};

const emitArray = (ctx: Context, schema: ArraySchema, acc: Code): Emitted => {
	const idx = x.local();
	const len = x.local();
	const elem = x.local();

	const inner = emitChild(ctx, schema.item, elem);

	const loop = (body: CodeFragment): CodeFragment => {
		return x`if(!${isArray}(${acc}))return ${INVALID};for(let ${idx}=0,${len}=${acc}.length;${idx}<${len};${idx}++){const ${elem}=${acc}[${idx}];${body}}`;
	};

	if (inner.output === null) {
		return unchanged(loop(inner.code));
	}

	const copy = x.local();
	const res = x.local();

	return {
		code: x`let ${copy};${loop(x`${inner.code}if(${inner.output.changed})(${copy}??=${acc}.slice())[${idx}]=${inner.output.value};`)}const ${res}=${copy}??${acc};`,
		output: { changed: x`${res}!==${acc}`, value: res },
	};
};

const emitObjectBody = (ctx: Context, schema: ObjectSchema, input: LocalIdent): CodeFragment => {
	const shape = schema.shape;

	const output = x.local();
	let body = x`if(!${isObject}(${input}))return ${INVALID};let ${output};`;

	// `__proto__` entries are defined as non-enumerable properties
	for (const key of Object.getOwnPropertyNames(shape)) {
		const entry = shape[key] as BaseSchema;
		const val = x.local();

		body = x`${body}const ${val}=${input}[${key}];`;
		if (entry.type !== 'optional') {
			body = x`${body}if(${val}===undefined&&!(${key} in ${input}))return ${INVALID};`;
		}

		const { code, output: res } = emitChild(ctx, entry, val);

		body = x`${body}${code}`;
		if (res === null) {
			continue;
		}

		if (key === '__proto__') {
			body = x`${body}if(${res.changed})Object.defineProperty(${output}??={...${input}},${key},{value:${res.value}});`;
		} else {
			body = x`${body}if(${res.changed})(${output}??={...${input}})[${key}]=${res.value};`;
		}
	}

	return x`${body}return ${output}??${input};`;
};

const emitVariant = (ctx: Context, schema: VariantSchema, acc: Code): Emitted => {
	// the matcher getter asserts every member's `$type`
	void schema['~run'];

	const type = x.local();
	const res = x.local();
	const changed = x.local();

	const seen = new Set<string>();
	let cases = x.empty;

	for (const raw of schema.members) {
		const member = raw.type === 'record' ? raw.object : raw;

		let t = member.shape.$type as BaseSchema;
		if (t.type === 'optional') {
			t = (t as OptionalSchema).wrapped;
		}

		// the interpreter picks the first member with a matching `$type`
		const expected = (t as LiteralSchema<string>).expected;
		if (seen.has(expected)) {
			continue;
		}

		seen.add(expected);

		const inner = emitChild(ctx, member, acc);
		cases = x`${cases}case ${expected}:{${inner.code}${adopt(inner.output, res, changed)}break;}`;
	}

	const fallthrough = schema.closed ? x`return ${INVALID};` : reject(x`typeof ${type}!=='string'`);

	return {
		code: x`if(!${isObject}(${acc}))return ${INVALID};const ${type}=${acc}.$type;let ${res}=${acc},${changed}=false;switch(${type}){${cases}default:${fallthrough}}`,
		output: { changed: changed, value: res },
	};
};

// #endregion

// #region compilation

const looseUnits = new WeakMap<BaseSchema, Unit>();
const strictUnits = new WeakMap<BaseSchema, Unit>();

// cache the unit before generating code so recursive schemas can reference it.
const getUnit = (schema: BaseSchema, strict: boolean): Unit => {
	const units = strict ? strictUnits : looseUnits;

	let unit = units.get(schema);
	if (unit === undefined) {
		unit = lazy(() => generate(schema, strict));
		units.set(schema, unit);
	}

	return unit;
};

const generate = (schema: BaseSchema, strict: boolean): Compiled => {
	const ctx: Context = {
		flags: FLAG_ABORT_EARLY | FLAG_DISCARD_ISSUES | (strict ? FLAG_STRICT : 0),
		stack: new Set(),
		strict: strict,
	};

	const input = x.local();

	let body: CodeFragment;
	if (schema.type === 'object' && Object.getPrototypeOf(schema) === Object.prototype) {
		body = emitObjectBody(ctx, schema as ObjectSchema, input);
	} else {
		const { code, output } = emitChild(ctx, schema, input);
		body = x`${code}return ${output?.value ?? input};`;
	}

	return x`'use strict';return function compiled(${input}){${body}}`.eval() as Compiled;
};

/** wraps compiled validation with interpreter fallback for issues */
const createCompiledMatcher = (schema: BaseSchema, fallback: Matcher): Matcher => {
	const loose = getUnit(schema, false);
	const strict = getUnit(schema, true);

	const matcher: Matcher = (input, flags) => {
		if (flags & FLAG_INTERPRET) {
			return fallback(input, flags);
		}

		const r = (flags & FLAG_STRICT ? strict : loose).value(input);

		if (r === input) {
			return undefined;
		}

		if (r !== INVALID) {
			return ok(r);
		}

		if (flags & FLAG_DISCARD_ISSUES) {
			return ISSUE_INVALID;
		}

		// bypass compiled matchers in nested schemas during the retry.
		return fallback(input, flags | FLAG_INTERPRET);
	};

	compiledMatchers.add(matcher);
	return matcher;
};

/**
 * enables lazy compilation of array, object and variant validators, including their nested schemas.
 *
 * call before validation; already-resolved matchers are unaffected. does nothing if runtime code generation
 * is unavailable.
 */
export const enableCompilation = (): void => {
	const tag = codegen.value;
	if (tag === undefined) {
		return;
	}

	x = tag;
	setCompiler(createCompiledMatcher);
};

// #endregion
