import type { Nsid } from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import {
	refineLexArray,
	refineLexBlob,
	refineLexBoolean,
	refineLexBytes,
	refineLexInteger,
	refineLexObject,
	refineLexRecord,
	refineLexRef,
	refineLexRefUnion,
	refineLexString,
	type RefineIssue,
} from './refinements.ts';
import type * as t from './types.ts';
import { formatLexiconRef, parseLexiconRef, type ParsedLexiconRef } from './utils/refs.ts';

export interface RecordValidatorInput {
	key: string | null;
	object: unknown;
}

export class RecordValidator {
	#validator: v.BaseSchema<RecordValidatorInput>;

	constructor(docs: Record<string, t.LexiconDoc>, nsid: Nsid) {
		const path: LexPath = {
			nsid: nsid,
			defId: 'main',
			dotPath: '',
		};

		const ctx: BuildContext = {
			docs: docs,
			cache: new WeakMap(),
		};

		const def = getDefinition(ctx, null, path);
		if (def.type !== 'record') {
			throw new Error(`${formatLexiconRef(path)} is not a record definition (got ${def.type})`);
		}

		const validator = v.object({
			key: v.nullable(buildRecordKey(def.key)),
			object: buildLexRecord(ctx, path, def).value,
		});

		this.#validator = validator;
	}

	is(input: RecordValidatorInput, options?: v.ValidationOptions): boolean {
		return v.is(this.#validator, input, options);
	}

	try(input: RecordValidatorInput, options?: v.ValidationOptions): v.ValidationResult<RecordValidatorInput> {
		return v.safeParse(this.#validator, input, options);
	}

	parse(input: RecordValidatorInput, options?: v.ValidationOptions): RecordValidatorInput {
		return v.parse(this.#validator, input, options);
	}
}

interface Cell<T> {
	readonly value: T;
}

const lazy = <T>(getter: () => T): Cell<T> => {
	return {
		get value() {
			const value = getter();

			Object.defineProperty(this, 'value', { value });
			return value;
		},
	};
};

const eager = <T>(value: T): Cell<T> => {
	return {
		value,
	};
};

interface LexPath extends ParsedLexiconRef {
	dotPath: string;
}

interface BuildContext {
	docs: Record<string, t.LexiconDoc>;
	cache: WeakMap<t.LexUserType, Cell<v.BaseSchema> | null>;
}

const formatPath = (path: LexPath) => {
	return formatLexiconRef(path) + path.dotPath;
};

const resolvePath = (path: LexPath, ref: string): LexPath => {
	const parsed = parseLexiconRef(ref, path.nsid);
	return { nsid: parsed.nsid, defId: parsed.defId, dotPath: '' };
};

const getDefinition = (ctx: BuildContext, from: LexPath | null, path: LexPath): t.LexUserType => {
	const doc = ctx.docs[path.nsid];
	if (doc === undefined) {
		if (from === null) {
			throw new Error(`can't find document: ${path.nsid}`);
		}

		throw new Error(`${formatLexiconRef(from)} tried to reference a nonexistent document: ${path.nsid}`);
	}

	const def = doc.defs[path.defId];
	if (def === undefined) {
		if (from === null) {
			throw new Error(`can't find definition: ${formatLexiconRef(path)}`);
		}

		throw new Error(
			`${formatLexiconRef(from)} tried to reference a nonexistent definition: ${formatLexiconRef(path)}`,
		);
	}

	return def;
};

const delve = (path: LexPath, nextSegment: string | number): LexPath => {
	return {
		nsid: path.nsid,
		defId: path.defId,
		dotPath: `${path.dotPath}/${nextSegment}`,
	};
};

const formatIssuePath = (path: LexPath, issuePath: (string | number)[]): string => {
	return formatPath(path) + (issuePath.length > 0 ? `/${issuePath.join('/')}` : ``);
};

const assertRefine = (path: LexPath, issues: RefineIssue[]) => {
	if (issues.length === 0) {
		return;
	}

	const first = issues[0];

	throw new Error(`${formatIssuePath(path, first.path)}: ${first.message}`);
};

const buildRecordKey = (key: t.LexRecord['key'] = 'any'): v.BaseSchema<string> => {
	if (key === 'any') {
		return v.string();
	}

	if (key === 'tid') {
		return v.tidString();
	}

	if (key === 'nsid') {
		return v.nsidString();
	}

	if (key.startsWith('literal:')) {
		return v.literal(key.slice(8));
	}

	return v.string();
};

// #region Concrete types
const buildLexBoolean = (ctx: BuildContext, path: LexPath, spec: t.LexBoolean): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell != undefined) {
		return cell;
	}

	assertRefine(path, refineLexBoolean(spec));

	const { const: constValue, default: defaultValue } = spec;

	let schema: v.BaseSchema = v.boolean();

	if (constValue !== undefined) {
		schema = v.literal(constValue);
	}

	if (defaultValue !== undefined) {
		schema = v.optional(schema, defaultValue);
	}

	cell = eager(schema);
	ctx.cache.set(spec, cell);

	return cell;
};

const buildLexInteger = (ctx: BuildContext, path: LexPath, spec: t.LexInteger): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell != undefined) {
		return cell;
	}

	assertRefine(path, refineLexInteger(spec));

	const {
		const: constValue,
		default: defaultValue,
		enum: enumValues,
		maximum = Infinity,
		minimum = 0,
	} = spec;

	const constraints: v.BaseConstraint<any>[] = [];

	if (minimum > 0 || maximum < Infinity) {
		constraints.push(v.integerRange(minimum, maximum));
	}

	let schema: v.BaseSchema = v.integer();

	if (constValue !== undefined) {
		schema = v.literal(constValue);
	} else if (enumValues !== undefined) {
		schema = v.literalEnum(enumValues.toSorted());
	} else if (constraints.length > 0) {
		schema = v.constrain(schema, constraints as any);
	}

	if (defaultValue !== undefined) {
		schema = v.optional(schema, defaultValue);
	}

	cell = eager(schema);
	ctx.cache.set(spec, cell);

	return cell;
};

const buildLexFormattedString = (format: t.LexStringFormat): v.BaseSchema<string> => {
	switch (format) {
		case 'at-identifier': {
			return v.actorIdentifierString();
		}
		case 'at-uri': {
			return v.resourceUriString();
		}
		case 'cid': {
			return v.cidString();
		}
		case 'datetime': {
			return v.datetimeString();
		}
		case 'did': {
			return v.didString();
		}
		case 'handle': {
			return v.handleString();
		}
		case 'language': {
			return v.languageCodeString();
		}
		case 'nsid': {
			return v.nsidString();
		}
		case 'record-key': {
			return v.recordKeyString();
		}
		case 'tid': {
			return v.tidString();
		}
		case 'uri': {
			return v.genericUriString();
		}
		default: {
			return v.string();
		}
	}
};

const buildLexString = (ctx: BuildContext, path: LexPath, spec: t.LexString): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell != undefined) {
		return cell;
	}

	assertRefine(path, refineLexString(spec));

	const {
		const: constValue,
		default: defaultValue,
		enum: enumValues,
		format,
		maxGraphemes = Infinity,
		maxLength = Infinity,
		minGraphemes = 0,
		minLength = 0,
	} = spec;

	const constraints: v.BaseConstraint<any>[] = [];

	if (minLength > 0 || maxLength < Infinity) {
		constraints.push(v.stringLength(minLength, maxLength));
	}

	if (minGraphemes > 0 || maxGraphemes < Infinity) {
		constraints.push(v.stringGraphemes(minGraphemes, maxGraphemes));
	}

	let schema: v.BaseSchema = v.string();

	if (format !== undefined) {
		schema = buildLexFormattedString(format);
	}

	if (constValue !== undefined) {
		schema = v.literal(constValue);
	} else if (enumValues !== undefined) {
		schema = v.literalEnum(enumValues.toSorted());
	} else if (constraints.length > 0) {
		schema = v.constrain(schema, constraints as any);
	}

	if (defaultValue !== undefined) {
		schema = v.optional(schema, defaultValue);
	}

	cell = eager(schema);
	ctx.cache.set(spec, cell);

	return cell;
};

const buildLexBytes = (ctx: BuildContext, path: LexPath, spec: t.LexBytes): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell != undefined) {
		return cell;
	}

	assertRefine(path, refineLexBytes(spec));

	const { maxLength = Infinity, minLength = 0 } = spec;

	const constraints: v.BaseConstraint<any>[] = [];

	if (minLength > 0 || maxLength < Infinity) {
		constraints.push(v.bytesSize(minLength, maxLength));
	}

	let schema: v.BaseSchema = v.bytes();

	if (constraints.length > 0) {
		schema = v.constrain(schema, constraints as any);
	}

	cell = eager(schema);
	ctx.cache.set(spec, cell);

	return cell;
};

const buildLexCidLink = (ctx: BuildContext, _path: LexPath, spec: t.LexCidLink): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell != undefined) {
		return cell;
	}

	let schema: v.BaseSchema = v.cidLink();

	cell = eager(schema);
	ctx.cache.set(spec, cell);

	return cell;
};

const simplifyAccept = (accept: string[] | undefined): string[] | undefined => {
	if (accept === undefined || accept.length === 0 || accept.includes('*/*')) {
		return undefined;
	}

	const wildcards = new Set<string>();
	for (const mime of accept) {
		if (mime.endsWith('/*')) {
			wildcards.add(mime.slice(0, mime.indexOf('/')));
		}
	}

	if (wildcards.size === 0) {
		return accept;
	}

	const simplified = accept.filter((mime) => {
		if (mime.endsWith('/*')) {
			return true;
		}
		return !wildcards.has(mime.slice(0, mime.indexOf('/')));
	});

	return simplified.length > 0 ? simplified : undefined;
};

const buildLexBlob = (ctx: BuildContext, path: LexPath, spec: t.LexBlob): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell != undefined) {
		return cell;
	}

	assertRefine(path, refineLexBlob(spec));

	const accept = simplifyAccept(spec.accept);
	const { maxSize } = spec;
	const constraints: v.BaseConstraint<any>[] = [];

	if (maxSize !== undefined) {
		constraints.push(v.blobSize(maxSize));
	}

	if (accept !== undefined) {
		constraints.push(v.blobAccept(accept));
	}

	let schema: v.BaseSchema = v.blob();

	if (constraints.length > 0) {
		schema = v.constrain(schema, constraints as any);
	}

	cell = eager(schema);
	ctx.cache.set(spec, cell);

	return cell;
};
// #endregion

// #region Meta types
const buildLexToken = (ctx: BuildContext, path: LexPath, spec: t.LexToken): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell != undefined) {
		return cell;
	}

	let schema: v.BaseSchema = v.literal(formatLexiconRef(path));

	cell = eager(schema);
	ctx.cache.set(spec, cell);

	return cell;
};

const buildLexRef = (ctx: BuildContext, path: LexPath, spec: t.LexRef): Cell<v.BaseSchema> => {
	assertRefine(path, refineLexRef(spec));

	const refPath = resolvePath(path, spec.ref);
	const refSpec = getDefinition(ctx, path, refPath);

	let cell: Cell<v.BaseSchema>;
	switch (refSpec.type) {
		// Concrete
		case 'boolean': {
			cell = buildLexBoolean(ctx, refPath, refSpec);
			break;
		}
		case 'integer': {
			cell = buildLexInteger(ctx, refPath, refSpec);
			break;
		}
		case 'string': {
			cell = buildLexString(ctx, refPath, refSpec);
			break;
		}
		case 'bytes': {
			cell = buildLexBytes(ctx, refPath, refSpec);
			break;
		}
		case 'cid-link': {
			cell = buildLexCidLink(ctx, refPath, refSpec);
			break;
		}
		case 'blob': {
			cell = buildLexBlob(ctx, refPath, refSpec);
			break;
		}

		// Meta
		case 'token': {
			cell = buildLexToken(ctx, refPath, refSpec);
			break;
		}
		case 'unknown': {
			cell = buildLexUnknown(ctx, refPath, refSpec);
			break;
		}

		// Container
		case 'array': {
			cell = buildLexArray(ctx, refPath, refSpec);
			break;
		}
		case 'object': {
			cell = buildLexObject(ctx, refPath, refSpec);
			break;
		}

		default: {
			refSpec satisfies Exclude<t.LexUserType, t.LexField>;
			throw new Error(`${formatPath(path)}/ref: unsupported type (${refSpec.type})`);
		}
	}

	return cell;
};

const buildLexRefUnion = (ctx: BuildContext, path: LexPath, spec: t.LexRefUnion): Cell<v.BaseSchema> => {
	assertRefine(path, refineLexRefUnion(spec));

	const lazyMembers = spec.refs.map((ref, idx): Cell<v.BaseSchema> => {
		const refPath = resolvePath(path, ref);
		const refSpec = getDefinition(ctx, path, refPath);

		// LexField & LexObject
		switch (refSpec.type) {
			case 'object': {
				return buildLexObject(ctx, refPath, refSpec);
			}
		}

		throw new Error(
			`${formatPath(path)}/refs/${idx}: unsupported ref target (${formatLexiconRef(refPath)} -> ${refSpec.type})`,
		);
	});

	return lazy(() => {
		const members = lazyMembers.map((cell) => cell.value);

		let schema: v.BaseSchema = v.variant(members as any);

		return schema;
	});
};

const buildLexUnknown = (ctx: BuildContext, _path: LexPath, spec: t.LexUnknown): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell != undefined) {
		return cell;
	}

	let schema: v.BaseSchema = v.unknown();

	cell = eager(schema);
	ctx.cache.set(spec, cell);

	return cell;
};
// #endregion

// #region Container types
const buildLexDefinableField = (
	ctx: BuildContext,
	path: LexPath,
	spec: t.LexDefinableField,
): { cell: Cell<v.BaseSchema>; isRef: boolean } => {
	let cell: Cell<v.BaseSchema>;
	let isRef = false;

	switch (spec.type) {
		// Concrete
		case 'boolean': {
			cell = buildLexBoolean(ctx, path, spec);
			break;
		}
		case 'integer': {
			cell = buildLexInteger(ctx, path, spec);
			break;
		}
		case 'string': {
			cell = buildLexString(ctx, path, spec);
			break;
		}
		case 'bytes': {
			cell = buildLexBytes(ctx, path, spec);
			break;
		}
		case 'cid-link': {
			cell = buildLexCidLink(ctx, path, spec);
			break;
		}
		case 'blob': {
			cell = buildLexBlob(ctx, path, spec);
			break;
		}

		// Meta
		case 'ref': {
			isRef = true;
			cell = buildLexRef(ctx, path, spec);
			break;
		}
		case 'union': {
			isRef = true;
			cell = buildLexRefUnion(ctx, path, spec);
			break;
		}
		case 'unknown': {
			cell = buildLexUnknown(ctx, path, spec);
			break;
		}

		// Container
		case 'array': {
			cell = buildLexArray(ctx, path, spec);
			break;
		}
		case 'object': {
			cell = buildLexObject(ctx, path, spec);
			break;
		}

		default: {
			spec satisfies never;
			throw new Error(`${formatPath(path)}: unsupported type`);
		}
	}

	return { cell: cell, isRef: isRef };
};

const buildLexArray = (ctx: BuildContext, path: LexPath, spec: t.LexArray): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell === null) {
		return lazy(() => ctx.cache.get(spec)!.value);
	}
	if (cell !== undefined) {
		return cell;
	}

	ctx.cache.set(spec, null);
	assertRefine(path, refineLexArray(spec));

	const { items: itemSpec, maxLength = Infinity, minLength = 0 } = spec;
	const field = buildLexDefinableField(ctx, delve(path, 'items'), itemSpec);

	cell = lazy(() => {
		const constraints: v.BaseConstraint<any>[] = [];

		if (minLength > 0 || maxLength < Infinity) {
			constraints.push(v.arrayLength(minLength, maxLength));
		}

		let schema: v.BaseSchema = v.array(field.isRef ? () => field.cell.value : field.cell.value);

		if (constraints.length > 0) {
			schema = v.constrain(schema, constraints as any);
		}

		return schema;
	});

	ctx.cache.set(spec, cell);
	return cell;
};

const isOptionalSchema = (schema: v.BaseSchema): schema is v.OptionalSchema => {
	return schema.type === 'optional';
};

const buildLexObject = (
	ctx: BuildContext,
	path: LexPath,
	spec: t.LexObject,
	writeType: 'required' | 'optional' | 'none' = 'optional',
): Cell<v.BaseSchema> => {
	let cell = ctx.cache.get(spec);
	if (cell === null) {
		return lazy(() => ctx.cache.get(spec)!.value);
	}
	if (cell !== undefined) {
		return cell;
	}

	ctx.cache.set(spec, null);
	assertRefine(path, refineLexObject(spec));

	const { nullable = [], properties = {}, required = [] } = spec;
	const entries: [prop: string, field: ReturnType<typeof buildLexDefinableField>][] = [];

	for (const prop in properties) {
		const propSpec = properties[prop];
		const field = buildLexDefinableField(ctx, delve(path, `properties/${prop}`), propSpec);

		entries.push([prop, field]);
	}

	cell = lazy(() => {
		const obj: Record<string, v.BaseSchema> = {};

		switch (writeType) {
			case 'optional': {
				obj.$type = v.optional(v.literal(formatLexiconRef(path)));
				break;
			}
			case 'required': {
				obj.$type = v.literal(formatLexiconRef(path));
				break;
			}
		}

		for (const [prop, { cell, isRef }] of entries) {
			const isOptional = !required.includes(prop);
			const isNullable = nullable.includes(prop);

			let c = cell;
			if (isOptional) {
				const orig = c;
				c = lazy(() => {
					const s = orig.value;
					if (isOptionalSchema(s)) {
						return s;
					}

					return v.optional(s);
				});
			}

			if (isNullable) {
				const orig = c;

				c = lazy(() => {
					return v.nullable(orig.value);
				});
			}

			if (isRef) {
				Object.defineProperty(obj, prop, { get: () => c.value });
			} else {
				if (prop === '__proto__') {
					Object.defineProperty(obj, prop, { enumerable: true, configurable: true, writable: true });
				}

				obj[prop] = c.value;
			}
		}

		let schema: v.BaseSchema = v.object(obj);

		return schema;
	});

	ctx.cache.set(spec, cell);
	return cell;
};
// #endregion

// #region Primary types
const buildLexRecord = (ctx: BuildContext, path: LexPath, spec: t.LexRecord): Cell<v.BaseSchema> => {
	assertRefine(path, refineLexRecord(spec));

	return buildLexObject(ctx, delve(path, 'record'), spec.record, 'required');
};
// #endregion
