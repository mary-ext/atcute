import { type Nsid } from '@atcute/lexicons/syntax';

import type * as t from './types.js';

import { isWithinGraphemeBounds, isWithinUtf8Bounds } from './internal/utils.js';
import { DELIMITED_MIME_TYPE_RE, KEY_RE, MIME_TYPE_RE, validateStringFormat } from './internal/validation.js';

// #region Utilities
type LexPath = {
	nsid: string;
	defId: string;
};

const toLexUri = (path: LexPath, from?: LexPath): string => {
	const { nsid, defId } = path;

	if (from !== undefined && from.nsid === nsid) {
		return `#${defId}`;
	}

	return defId === 'main' ? nsid : `${nsid}#${defId}`;
};

type BuildContext = {
	toplevelDefs: Map<DefType | MainType, LexPath>;
	lexPath: LexPath;
	dotPath: string;
};

const delve = (ctx: BuildContext, path: string): BuildContext => {
	return { ...ctx, dotPath: `${ctx.dotPath}/${path}` };
};

const getReference = (ctx: BuildContext, def: DefType | MainType): t.LexRef | undefined => {
	const defPath = ctx.toplevelDefs.get(def);
	if (defPath === undefined) {
		return undefined;
	}

	return {
		type: 'ref',
		ref: toLexUri(defPath, ctx.lexPath),
	};
};

const requireReference = (ctx: BuildContext, def: DefType | MainType): t.LexRef => {
	const ref = getReference(ctx, def);
	if (ref === undefined) {
		throw new Error(`${ctx.dotPath}: cannot be found as a top-level definition anywhere`);
	}

	return ref;
};

/**
 * annotations shared by lexicon builder definitions
 */
export type Annotations = {
	description?: string;
};
// #endregion

// #region Concrete types
/**
 * builder definition for a boolean field
 */
export interface LexBooleanBuilder extends Annotations {
	type: 'boolean';
	/** default boolean value */
	default?: boolean;
	/** fixed boolean value */
	const?: boolean;
}

/**
 * builds a boolean definition
 * @param def optional boolean definition options
 * @returns boolean builder definition
 */
export const boolean = (def: Omit<LexBooleanBuilder, 'type'> = {}): LexBooleanBuilder => {
	const { const: constValue, default: defaultValue } = def;

	if (defaultValue !== undefined) {
		if (constValue !== undefined && defaultValue !== constValue) {
			throw new Error(`boolean/default: value must match const value`);
		}
	}

	return { ...def, type: 'boolean' };
};

const buildBooleanSchema = (_ctx: BuildContext, def: LexBooleanBuilder): t.LexBoolean => {
	return {
		const: def.const,
		default: def.default,
		description: def.description,
		type: 'boolean',
	};
};

/**
 * builder definition for a signed integer field
 */
export interface LexIntegerBuilder extends Annotations {
	type: 'integer';
	/** default integer value */
	default?: number;
	/** minimum allowed value */
	minimum?: number;
	/** maximum allowed value */
	maximum?: number;
	/** closed set of allowed values */
	enum?: number[];
	/** fixed integer value */
	const?: number;
}

/**
 * builds an integer definition
 * @param def optional integer definition options
 * @returns integer builder definition
 */
export const integer = (def: Omit<LexIntegerBuilder, 'type'> = {}): LexIntegerBuilder => {
	const { minimum = 0, maximum = Infinity, const: constValue, default: defaultValue, enum: enumValues } = def;

	if (minimum > maximum) {
		throw new Error(`integer/minimum: value (${minimum}) can't be greater than maximum value (${maximum})`);
	}

	if (defaultValue !== undefined) {
		if (constValue !== undefined && defaultValue !== constValue) {
			throw new Error(`integer/default: value must match const value`);
		}

		if (enumValues !== undefined && !enumValues.includes(defaultValue)) {
			throw new Error(`integer/default: value must be one of the enum values`);
		}

		if (defaultValue < minimum) {
			throw new Error(
				`integer/default: value (${defaultValue}) can't be lower than minimum value (${minimum})`,
			);
		}

		if (defaultValue > maximum) {
			throw new Error(
				`integer/default: value (${defaultValue}) can't be greater than maximum value (${maximum})`,
			);
		}
	}

	if (constValue !== undefined) {
		if (enumValues !== undefined) {
			throw new Error(`integer/const: const and enum can't be used together`);
		}

		if (constValue < minimum) {
			throw new Error(`integer/const: value (${constValue}) can't be lower than minimum value (${minimum})`);
		}

		if (constValue > maximum) {
			throw new Error(
				`integer/const: value (${constValue}) can't be greater than maximum value (${maximum})`,
			);
		}
	}

	if (enumValues !== undefined) {
		for (let idx = 0, len = enumValues.length; idx < len; idx++) {
			const enumValue = enumValues[idx];

			if (enumValue < minimum) {
				throw new Error(
					`integer/enum[${idx}]: value (${enumValue}) can't be lower than minimum value (${minimum})`,
				);
			}

			if (enumValue > maximum) {
				throw new Error(
					`integer/enum[${idx}]: value (${enumValue}) can't be greater than maximum value (${maximum})`,
				);
			}
		}
	}

	return { ...def, type: 'integer' };
};

const buildIntegerSchema = (_ctx: BuildContext, def: LexIntegerBuilder): t.LexInteger => {
	return {
		const: def.const,
		default: def.default,
		description: def.description,
		enum: def.enum,
		maximum: def.maximum,
		minimum: def.minimum,
		type: 'integer',
	};
};

/**
 * builder definition for a string field
 */
export interface LexStringBuilder extends Annotations {
	type: 'string';
	/** semantic format constraint */
	format?: t.LexStringFormat;
	/** default string or token reference */
	default?: string | LexTokenBuilder;
	/** minimum length in utf-8 bytes */
	minLength?: number;
	/** maximum length in utf-8 bytes */
	maxLength?: number;
	/** minimum grapheme count */
	minGraphemes?: number;
	/** maximum grapheme count */
	maxGraphemes?: number;
	/** closed set of allowed values */
	enum?: (string | LexTokenBuilder)[];
	/** fixed string or token reference */
	const?: string | LexTokenBuilder;
	/** suggested values */
	knownValues?: (string | LexTokenBuilder)[];
}

/**
 * builds a string definition
 * @param def optional string definition options
 * @returns string builder definition
 */
export const string = (def: Omit<LexStringBuilder, 'type'> = {}): LexStringBuilder => {
	const {
		format,
		minLength = 0,
		maxLength = Infinity,
		minGraphemes = 0,
		maxGraphemes = Infinity,
		const: constValue,
		default: defaultValue,
		enum: enumValues,
		knownValues,
	} = def;

	if (minLength > maxLength) {
		throw new Error(
			`string/minLength: value (${minLength}) can't be greater than maximum length (${maxLength})`,
		);
	}

	if (minGraphemes > maxGraphemes) {
		throw new Error(
			`string/minGraphemes: value (${minGraphemes}) can't be greater than maximum graphemes (${maxGraphemes})`,
		);
	}

	if (defaultValue !== undefined && typeof defaultValue === 'string') {
		if (constValue !== undefined && typeof constValue === 'string' && defaultValue !== constValue) {
			throw new Error(`string/default: value must match const value`);
		}

		if (enumValues !== undefined) {
			const allStrings = enumValues.every((v) => typeof v === 'string');
			if (allStrings && !enumValues.includes(defaultValue)) {
				throw new Error(`string/default: value must be one of the enum values`);
			}
		}

		{
			const bound = isWithinUtf8Bounds(defaultValue, minLength, maxLength);

			if (bound === 'min') {
				throw new Error(
					`string/default: value (${JSON.stringify(defaultValue)}) can't be shorter than minimum length (${minLength})`,
				);
			}

			if (bound === 'max') {
				throw new Error(
					`string/default: value (${JSON.stringify(defaultValue)}) can't be longer than maximum length (${maxLength})`,
				);
			}
		}

		{
			const bound = isWithinGraphemeBounds(defaultValue, minGraphemes, maxGraphemes);

			if (bound === 'min') {
				throw new Error(
					`string/default: value (${JSON.stringify(defaultValue)}) can't be shorter than minimum graphemes (${minGraphemes})`,
				);
			}

			if (bound === 'max') {
				throw new Error(
					`string/default: value (${JSON.stringify(defaultValue)}) can't be longer than maximum graphemes (${maxGraphemes})`,
				);
			}
		}

		if (format !== undefined && !validateStringFormat(defaultValue, format)) {
			throw new Error(
				`string/default: value (${JSON.stringify(defaultValue)}) does not match format '${format}'`,
			);
		}
	}

	if (constValue !== undefined) {
		if (enumValues !== undefined) {
			throw new Error(`string/const: const and enum can't be used together`);
		}

		if (knownValues !== undefined) {
			throw new Error(`string/const: const and knownValues can't be used together`);
		}

		if (typeof constValue === 'string') {
			{
				const bound = isWithinUtf8Bounds(constValue, minLength, maxLength);

				if (bound === 'min') {
					throw new Error(
						`string/const: value (${JSON.stringify(constValue)}) can't be shorter than minimum length (${minLength})`,
					);
				}

				if (bound === 'max') {
					throw new Error(
						`string/const: value (${JSON.stringify(constValue)}) can't be longer than maximum length (${maxLength})`,
					);
				}
			}

			{
				const bound = isWithinGraphemeBounds(constValue, minGraphemes, maxGraphemes);

				if (bound === 'min') {
					throw new Error(
						`string/const: value (${JSON.stringify(constValue)}) can't be shorter than minimum graphemes (${minGraphemes})`,
					);
				}

				if (bound === 'max') {
					throw new Error(
						`string/const: value (${JSON.stringify(constValue)}) can't be longer than maximum graphemes (${maxGraphemes})`,
					);
				}
			}

			if (format !== undefined && !validateStringFormat(constValue, format)) {
				throw new Error(
					`string/const: value (${JSON.stringify(constValue)}) does not match format '${format}'`,
				);
			}
		}
	}

	if (enumValues !== undefined) {
		if (knownValues !== undefined) {
			throw new Error(`string/enum: enum and knownValues can't be used together`);
		}

		for (let idx = 0, len = enumValues.length; idx < len; idx++) {
			const enumValue = enumValues[idx];

			if (typeof enumValue === 'string') {
				{
					const bound = isWithinUtf8Bounds(enumValue, minLength, maxLength);

					if (bound === 'min') {
						throw new Error(
							`string/enum[${idx}]: value (${JSON.stringify(enumValue)}) can't be shorter than minimum length (${minLength})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`string/enum[${idx}]: value (${JSON.stringify(enumValue)}) can't be longer than maximum length (${maxLength})`,
						);
					}
				}

				{
					const bound = isWithinGraphemeBounds(enumValue, minGraphemes, maxGraphemes);

					if (bound === 'min') {
						throw new Error(
							`string/enum[${idx}]: value (${JSON.stringify(enumValue)}) can't have fewer graphemes than minimum graphemes (${minGraphemes})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`string/enum[${idx}]: value (${JSON.stringify(enumValue)}) can't have more graphemes than maximum graphemes (${maxGraphemes})`,
						);
					}
				}

				if (format !== undefined && !validateStringFormat(enumValue, format)) {
					throw new Error(
						`string/enum[${idx}]: value (${JSON.stringify(enumValue)}) does not match format '${format}'`,
					);
				}
			}
		}
	}

	if (knownValues !== undefined) {
		for (let idx = 0, len = knownValues.length; idx < len; idx++) {
			const knownValue = knownValues[idx];

			if (typeof knownValue === 'string') {
				{
					const bound = isWithinUtf8Bounds(knownValue, minLength, maxLength);

					if (bound === 'min') {
						throw new Error(
							`string/knownValues[${idx}]: value (${JSON.stringify(knownValue)}) can't be shorter than minimum length (${minLength})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`string/knownValues[${idx}]: value (${JSON.stringify(knownValue)}) can't be longer than maximum length (${maxLength})`,
						);
					}
				}

				{
					const bound = isWithinGraphemeBounds(knownValue, minGraphemes, maxGraphemes);

					if (bound === 'min') {
						throw new Error(
							`string/knownValues[${idx}]: value (${JSON.stringify(knownValue)}) can't have fewer graphemes than minimum graphemes (${minGraphemes})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`string/knownValues[${idx}]: value (${JSON.stringify(knownValue)}) can't have more graphemes than maximum graphemes (${maxGraphemes})`,
						);
					}
				}

				if (format !== undefined && !validateStringFormat(knownValue, format)) {
					throw new Error(
						`string/knownValues[${idx}]: value (${JSON.stringify(knownValue)}) does not match format '${format}'`,
					);
				}
			}
		}
	}

	return { ...def, type: 'string' };
};

const resolveStringTokenReference = (ctx: BuildContext, def: LexTokenBuilder): string => {
	const defPath = ctx.toplevelDefs.get(def);
	if (defPath === undefined) {
		throw new Error(`${ctx.dotPath}: references an undefined token`);
	}

	// don't use the relative path here
	return toLexUri(defPath);
};

const buildStringSchema = (ctx: BuildContext, def: LexStringBuilder): t.LexString => {
	const {
		format,
		default: defaultValue,
		enum: enumValues,
		const: constValue,
		knownValues,
		minLength = 0,
		maxLength = Infinity,
		minGraphemes = 0,
		maxGraphemes = Infinity,
	} = def;

	const builtConstValue =
		constValue !== undefined
			? typeof constValue === 'string'
				? constValue
				: resolveStringTokenReference(delve(ctx, 'const'), constValue)
			: undefined;

	const builtDefaultValue =
		defaultValue !== undefined
			? typeof defaultValue === 'string'
				? defaultValue
				: resolveStringTokenReference(delve(ctx, 'default'), defaultValue)
			: undefined;

	const builtEnumValues =
		enumValues !== undefined
			? enumValues.map((value, index) => {
					return typeof value === 'string'
						? value
						: resolveStringTokenReference(delve(ctx, `enum/${index}`), value);
				})
			: undefined;

	const builtKnownValues =
		knownValues !== undefined
			? knownValues.map((value, index) => {
					return typeof value === 'string'
						? value
						: resolveStringTokenReference(delve(ctx, `knownValues/${index}`), value);
				})
			: undefined;

	// validate resolved const value
	if (builtConstValue !== undefined && typeof constValue !== 'string') {
		{
			const bound = isWithinUtf8Bounds(builtConstValue, minLength, maxLength);

			if (bound === 'min') {
				throw new Error(
					`${ctx.dotPath}/const: value (${JSON.stringify(builtConstValue)}) can't be shorter than minimum length (${minLength})`,
				);
			}

			if (bound === 'max') {
				throw new Error(
					`${ctx.dotPath}/const: value (${JSON.stringify(builtConstValue)}) can't be longer than maximum length (${maxLength})`,
				);
			}
		}

		{
			const bound = isWithinGraphemeBounds(builtConstValue, minGraphemes, maxGraphemes);

			if (bound === 'min') {
				throw new Error(
					`${ctx.dotPath}/const: value (${JSON.stringify(builtConstValue)}) can't be shorter than minimum graphemes (${minGraphemes})`,
				);
			}

			if (bound === 'max') {
				throw new Error(
					`${ctx.dotPath}/const: value (${JSON.stringify(builtConstValue)}) can't be longer than maximum graphemes (${maxGraphemes})`,
				);
			}
		}

		if (format !== undefined && !validateStringFormat(builtConstValue, format)) {
			throw new Error(
				`${ctx.dotPath}/const: value (${JSON.stringify(builtConstValue)}) does not match format '${format}'`,
			);
		}
	}

	// validate resolved default value
	if (builtDefaultValue !== undefined && typeof defaultValue !== 'string') {
		if (builtConstValue !== undefined && builtDefaultValue !== builtConstValue) {
			throw new Error(`${ctx.dotPath}/default: value must match const value`);
		}

		if (builtEnumValues !== undefined && !builtEnumValues.includes(builtDefaultValue)) {
			throw new Error(`${ctx.dotPath}/default: value must be one of the enum values`);
		}

		{
			const bound = isWithinUtf8Bounds(builtDefaultValue, minLength, maxLength);

			if (bound === 'min') {
				throw new Error(
					`${ctx.dotPath}/default: value (${JSON.stringify(builtDefaultValue)}) can't be shorter than minimum length (${minLength})`,
				);
			}

			if (bound === 'max') {
				throw new Error(
					`${ctx.dotPath}/default: value (${JSON.stringify(builtDefaultValue)}) can't be longer than maximum length (${maxLength})`,
				);
			}
		}

		{
			const bound = isWithinGraphemeBounds(builtDefaultValue, minGraphemes, maxGraphemes);

			if (bound === 'min') {
				throw new Error(
					`${ctx.dotPath}/default: value (${JSON.stringify(builtDefaultValue)}) can't be shorter than minimum graphemes (${minGraphemes})`,
				);
			}

			if (bound === 'max') {
				throw new Error(
					`${ctx.dotPath}/default: value (${JSON.stringify(builtDefaultValue)}) can't be longer than maximum graphemes (${maxGraphemes})`,
				);
			}
		}

		if (format !== undefined && !validateStringFormat(builtDefaultValue, format)) {
			throw new Error(
				`${ctx.dotPath}/default: value (${JSON.stringify(builtDefaultValue)}) does not match format '${format}'`,
			);
		}
	}

	// validate resolved enum values
	if (builtEnumValues !== undefined && enumValues !== undefined) {
		for (let idx = 0, len = builtEnumValues.length; idx < len; idx++) {
			const enumValue = enumValues[idx];
			const builtEnumValue = builtEnumValues[idx];

			if (typeof enumValue !== 'string') {
				{
					const bound = isWithinUtf8Bounds(builtEnumValue, minLength, maxLength);

					if (bound === 'min') {
						throw new Error(
							`${ctx.dotPath}/enum/${idx}: value (${JSON.stringify(builtEnumValue)}) can't be shorter than minimum length (${minLength})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`${ctx.dotPath}/enum/${idx}: value (${JSON.stringify(builtEnumValue)}) can't be longer than maximum length (${maxLength})`,
						);
					}
				}

				{
					const bound = isWithinGraphemeBounds(builtEnumValue, minGraphemes, maxGraphemes);

					if (bound === 'min') {
						throw new Error(
							`${ctx.dotPath}/enum/${idx}: value (${JSON.stringify(builtEnumValue)}) can't have fewer graphemes than minimum graphemes (${minGraphemes})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`${ctx.dotPath}/enum/${idx}: value (${JSON.stringify(builtEnumValue)}) can't have more graphemes than maximum graphemes (${maxGraphemes})`,
						);
					}
				}

				if (format !== undefined && !validateStringFormat(builtEnumValue, format)) {
					throw new Error(
						`${ctx.dotPath}/enum/${idx}: value (${JSON.stringify(builtEnumValue)}) does not match format '${format}'`,
					);
				}
			}
		}
	}

	// validate resolved knownValues
	if (builtKnownValues !== undefined && knownValues !== undefined) {
		for (let idx = 0, len = builtKnownValues.length; idx < len; idx++) {
			const knownValue = knownValues[idx];
			const builtKnownValue = builtKnownValues[idx];

			if (typeof knownValue !== 'string') {
				{
					const bound = isWithinUtf8Bounds(builtKnownValue, minLength, maxLength);

					if (bound === 'min') {
						throw new Error(
							`${ctx.dotPath}/knownValues/${idx}: value (${JSON.stringify(builtKnownValue)}) can't be shorter than minimum length (${minLength})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`${ctx.dotPath}/knownValues/${idx}: value (${JSON.stringify(builtKnownValue)}) can't be longer than maximum length (${maxLength})`,
						);
					}
				}

				{
					const bound = isWithinGraphemeBounds(builtKnownValue, minGraphemes, maxGraphemes);

					if (bound === 'min') {
						throw new Error(
							`${ctx.dotPath}/knownValues/${idx}: value (${JSON.stringify(builtKnownValue)}) can't have fewer graphemes than minimum graphemes (${minGraphemes})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`${ctx.dotPath}/knownValues/${idx}: value (${JSON.stringify(builtKnownValue)}) can't have more graphemes than maximum graphemes (${maxGraphemes})`,
						);
					}
				}

				if (format !== undefined && !validateStringFormat(builtKnownValue, format)) {
					throw new Error(
						`${ctx.dotPath}/knownValues/${idx}: value (${JSON.stringify(builtKnownValue)}) does not match format '${format}'`,
					);
				}
			}
		}
	}

	return {
		type: 'string',
		const: builtConstValue,
		default: builtDefaultValue,
		description: def.description,
		enum: builtEnumValues,
		format: def.format,
		knownValues: builtKnownValues,
		maxGraphemes: def.maxGraphemes,
		maxLength: def.maxLength,
		minGraphemes: def.minGraphemes,
		minLength: def.minLength,
	};
};

/**
 * builder definition for raw binary data
 */
export interface LexBytesBuilder extends Annotations {
	type: 'bytes';
	/** minimum size in bytes */
	minLength?: number;
	/** maximum size in bytes */
	maxLength?: number;
}

/**
 * builds a bytes definition
 * @param def optional bytes definition options
 * @returns bytes builder definition
 */
export const bytes = (def: Omit<LexBytesBuilder, 'type'> = {}): LexBytesBuilder => {
	const { minLength = 0, maxLength = Infinity } = def;

	if (minLength > maxLength) {
		throw new Error(
			`bytes/minLength: value (${minLength}) can't be greater than maximum length (${maxLength})`,
		);
	}

	return { ...def, type: 'bytes' };
};

const buildBytesSchema = (_ctx: BuildContext, def: LexBytesBuilder): t.LexBytes => {
	return {
		description: def.description,
		maxLength: def.maxLength,
		minLength: def.minLength,
		type: 'bytes',
	};
};

/**
 * builder definition for a cid-link reference
 */
export interface LexCidLinkBuilder extends Annotations {
	type: 'cid-link';
}

/**
 * builds a cid-link definition
 * @param def optional cid-link definition options
 * @returns cid-link builder definition
 */
export const cidLink = (def?: Omit<LexCidLinkBuilder, 'type'>): LexCidLinkBuilder => {
	return { ...def, type: 'cid-link' };
};

const buildCidLinkSchema = (_ctx: BuildContext, def: LexCidLinkBuilder): t.LexCidLink => {
	return {
		description: def.description,
		type: 'cid-link',
	};
};

/**
 * builder definition for binary attachments
 */
export interface LexBlobBuilder extends Annotations {
	type: 'blob';
	/** allowed MIME types */
	accept?: string[];
	/** maximum size in bytes */
	maxSize?: number;
}

/**
 * builds a blob definition
 * @param def optional blob definition options
 * @returns blob builder definition
 */
export const blob = (def: Omit<LexBlobBuilder, 'type'> = {}): LexBlobBuilder => {
	const { accept = [] } = def;

	if (accept.includes('*/*')) {
		if (accept.length > 1) {
			throw new Error(`blob/accept: no other MIME types can be specified when a wildcard is present`);
		}
	} else {
		for (let idx = 0, len = accept.length; idx < len; idx++) {
			const mime = accept[idx];

			if (!MIME_TYPE_RE.test(mime)) {
				throw new Error(`blob/accept[${idx}]: invalid MIME type (${mime})`);
			}
		}
	}

	return { ...def, type: 'blob' };
};

const buildBlobSchema = (_ctx: BuildContext, def: LexBlobBuilder): t.LexBlob => {
	return {
		accept: def.accept,
		description: def.description,
		maxSize: def.maxSize,
		type: 'blob',
	};
};

type LexPrimitiveBuilder = LexBooleanBuilder | LexIntegerBuilder | LexStringBuilder;

type LexConcreteBuilder =
	| LexBooleanBuilder
	| LexIntegerBuilder
	| LexStringBuilder
	| LexBytesBuilder
	| LexCidLinkBuilder
	| LexBlobBuilder;
// #endregion

// #region Meta types
/**
 * builder definition for a named token reference
 */
export interface LexTokenBuilder extends Annotations {
	type: 'token';
}

/**
 * builds a token definition
 * @param def optional token definition options
 * @returns token builder definition
 */
export const token = (def?: Omit<LexTokenBuilder, 'type'>): LexTokenBuilder => {
	return { ...def, type: 'token' };
};

const buildTokenSchema = (_ctx: BuildContext, def: LexTokenBuilder): t.LexToken => {
	return {
		description: def.description,
		type: 'token',
	};
};

/**
 * builder definition for a ref to another schema
 */
export interface LexRefBuilder extends Annotations {
	type: 'ref';
	/** reference URI or fragment */
	ref: string;
}

/**
 * builds a ref definition
 * @param def ref definition parameters
 * @returns ref builder definition
 */
export const ref = (def: Omit<LexRefBuilder, 'type'>): LexRefBuilder => {
	return { ...def, type: 'ref' };
};

const buildRefSchema = (_ctx: BuildContext, def: LexRefBuilder): t.LexRef => {
	return {
		description: def.description,
		ref: def.ref,
		type: 'ref',
	};
};

/**
 * builder definition for a union of referenced schemas
 */
export interface LexRefUnionBuilder extends Annotations {
	type: 'union';
	/** referenced variants for the union */
	refs: Array<
		// referable
		| LexObjectBuilder
		// inlinable
		| LexRefBuilder
	>;
	/** marks the union as closed */
	closed?: boolean;
}

/**
 * builds a union definition
 * @param def union definition parameters
 * @returns union builder definition
 */
export const union = (def: Omit<LexRefUnionBuilder, 'type'>): LexRefUnionBuilder => {
	const { refs, closed = false } = def;

	if (closed) {
		if (refs.length === 0) {
			throw new Error(`union/refs: closed unions can't be empty`);
		}
	}

	return { ...def, type: 'union' };
};

const buildUnionSchema = (ctx: BuildContext, def: LexRefUnionBuilder): t.LexRefUnion => {
	return {
		closed: def.closed,
		description: def.description,
		refs: def.refs.map((item, index) => {
			if (item.type === 'ref') {
				return item.ref;
			}

			const defPath = ctx.toplevelDefs.get(item);
			if (defPath === undefined) {
				throw new Error(`${ctx.dotPath}/refs/${index}: must be defined as a top-level definition`);
			}

			return toLexUri(defPath, ctx.lexPath);
		}),
		type: 'union',
	};
};

/**
 * builder definition for an unknown value
 */
export interface LexUnknownBuilder extends Annotations {
	type: 'unknown';
}

/**
 * builds an unknown definition
 * @param def optional unknown definition options
 * @returns unknown builder definition
 */
export const unknown = (def?: Omit<LexUnknownBuilder, 'type'>): LexUnknownBuilder => {
	return { ...def, type: 'unknown' };
};

const buildUnknownSchema = (_ctx: BuildContext, def: LexUnknownBuilder): t.LexUnknown => {
	return {
		description: def.description,
		type: 'unknown',
	};
};

type LexRefVariantBuilder = LexRefBuilder | LexRefUnionBuilder;

type LexMetaBuilder = LexTokenBuilder | LexRefBuilder | LexRefUnionBuilder | LexUnknownBuilder;
// #endregion

// #region Container types
type LexFieldBuilder = LexConcreteBuilder | LexMetaBuilder | LexContainerBuilder;

const buildFieldSchema = (ctx: BuildContext, def: LexFieldBuilder): t.LexDefinableField => {
	switch (def.type) {
		// Concrete
		case 'boolean': {
			return getReference(ctx, def) ?? buildBooleanSchema(ctx, def);
		}
		case 'integer': {
			return getReference(ctx, def) ?? buildIntegerSchema(ctx, def);
		}
		case 'string': {
			return getReference(ctx, def) ?? buildStringSchema(ctx, def);
		}
		case 'bytes': {
			return getReference(ctx, def) ?? buildBytesSchema(ctx, def);
		}
		case 'cid-link': {
			return getReference(ctx, def) ?? buildCidLinkSchema(ctx, def);
		}
		case 'blob': {
			return getReference(ctx, def) ?? buildBlobSchema(ctx, def);
		}

		// Meta
		case 'token': {
			return requireReference(ctx, def);
		}
		case 'ref': {
			return buildRefSchema(ctx, def);
		}
		case 'union': {
			return buildUnionSchema(ctx, def);
		}
		case 'unknown': {
			return getReference(ctx, def) ?? buildUnknownSchema(ctx, def);
		}

		// Container
		case 'array': {
			return getReference(ctx, def) ?? buildArraySchema(ctx, def);
		}
		case 'object': {
			return requireReference(ctx, def);
		}
	}
};

/**
 * builder definition for an array field
 */
export interface LexArrayBuilder<TItems extends LexFieldBuilder = LexFieldBuilder> extends Annotations {
	type: 'array';
	/** schema for array elements */
	items: TItems;
	/** minimum item count */
	minLength?: number;
	/** maximum item count */
	maxLength?: number;
}

type LexPrimitiveArrayBuilder = LexArrayBuilder<LexPrimitiveBuilder>;

/**
 * builds an array definition
 * @param def array definition parameters
 * @returns array builder definition
 */
export const array = <TItems extends LexFieldBuilder>(
	def: Omit<LexArrayBuilder<TItems>, 'type'>,
): LexArrayBuilder<TItems> => {
	const { minLength = 0, maxLength = Infinity } = def;

	if (minLength > maxLength) {
		throw new Error(
			`array/minLength: value (${minLength}) can't be greater than maximum length (${maxLength})`,
		);
	}

	return { ...def, type: 'array' };
};

const buildArraySchema = (ctx: BuildContext, def: LexArrayBuilder): t.LexArray => {
	return {
		description: def.description,
		items: buildFieldSchema(delve(ctx, 'items'), def.items),
		maxLength: def.maxLength,
		minLength: def.minLength,
		type: 'array',
	};
};

/**
 * wraps a field definition with requirement and nullability metadata
 */
export type FieldWrapper<T> = {
	type: 'field-wrapper';
	wrapped: T;
	required: boolean;
	nullable: boolean;
};

/**
 * optionally wrapped field definition
 */
export type MaybeFieldWrapper<T> = T | FieldWrapper<T>;

/**
 * builder definition for an object schema
 */
export interface LexObjectBuilder extends Annotations {
	type: 'object';
	/** property definitions keyed by name */
	properties?: Record<string, MaybeFieldWrapper<LexFieldBuilder>>;
}

const wrapField = <T extends LexFieldBuilder>(
	def: T,
	required: boolean,
	nullable: boolean,
): FieldWrapper<T> => {
	return {
		type: 'field-wrapper',
		wrapped: def,
		required: required,
		nullable: nullable,
	};
};

/**
 * builds an object definition
 * @param def optional object definition options
 * @returns object builder definition
 */
export const object = (def: Omit<LexObjectBuilder, 'type'> = {}): LexObjectBuilder => {
	const { properties } = def;

	if (properties !== undefined) {
		for (const prop in properties) {
			if (!KEY_RE.test(prop)) {
				throw new Error(`object/properties: invalid "${prop}" property name`);
			}
		}
	}

	return { ...def, type: 'object' };
};

/**
 * marks a field definition as required
 * @param def field definition to wrap
 * @returns wrapped field definition marked required
 */
export const required = <T extends LexFieldBuilder>(def: MaybeFieldWrapper<T>): FieldWrapper<T> => {
	if (def.type === 'field-wrapper') {
		return wrapField(def.wrapped, true, def.nullable);
	}

	return wrapField(def, true, false);
};

/**
 * marks a field definition as nullable
 * @param def field definition to wrap
 * @returns wrapped field definition marked nullable
 */
export const nullable = <T extends LexFieldBuilder>(def: MaybeFieldWrapper<T>): FieldWrapper<T> => {
	if (def.type === 'field-wrapper') {
		return wrapField(def.wrapped, def.required, true);
	}

	return wrapField(def, false, true);
};

const buildObjectSchema = (ctx: BuildContext, def: LexObjectBuilder): t.LexObject => {
	const properties: Record<string, t.LexDefinableField> = {};
	const required: string[] = [];
	const nullable: string[] = [];

	if (def.properties) {
		for (const prop in def.properties) {
			const propDef = def.properties[prop];

			let unwrapped: LexFieldBuilder;
			let isRequired = false;
			let isNullable = false;

			if (propDef.type === 'field-wrapper') {
				unwrapped = propDef.wrapped;
				isRequired = propDef.required;
				isNullable = propDef.nullable;
			} else {
				unwrapped = propDef;
			}

			if (isRequired) {
				required.push(prop);
			}
			if (isNullable) {
				nullable.push(prop);
			}

			properties[prop] = buildFieldSchema(delve(ctx, prop), unwrapped);
		}
	}

	return {
		description: def.description,
		nullable: nullable.length > 0 ? nullable : undefined,
		properties: Object.keys(properties).length > 0 ? properties : undefined,
		required: required.length > 0 ? required : undefined,
		type: 'object',
	};
};

type LexContainerBuilder = LexArrayBuilder | LexObjectBuilder;
// #endregion

// #region Miscellaneous
interface XrpcBody extends Annotations {
	encoding: string;
	schema?: LexRefVariantBuilder | LexObjectBuilder;
}

const buildXrpcBodySchema = (ctx: BuildContext, def: XrpcBody): t.LexXrpcBody => {
	let schema: t.LexXrpcBody['schema'] | undefined;

	if (def.schema) {
		const schemaCtx = delve(ctx, 'schema');

		switch (def.schema.type) {
			case 'ref': {
				schema = buildRefSchema(schemaCtx, def.schema);
				break;
			}
			case 'union': {
				schema = buildUnionSchema(schemaCtx, def.schema);
				break;
			}
			case 'object': {
				schema = getReference(schemaCtx, def.schema) ?? buildObjectSchema(schemaCtx, def.schema);
				break;
			}
		}
	}

	return {
		description: def.description,
		encoding: def.encoding,
		schema: schema,
	};
};

interface XrpcSubscriptionMessage extends Annotations {
	schema?: LexRefUnionBuilder;
}

const buildSubscriptionMessageSchema = (
	ctx: BuildContext,
	def: XrpcSubscriptionMessage,
): t.LexXrpcSubscriptionMessage => {
	let schema: t.LexXrpcSubscriptionMessage['schema'] | undefined;

	if (def.schema) {
		const schemaCtx = delve(ctx, 'schema');
		schema = buildUnionSchema(schemaCtx, def.schema);
	}

	return {
		description: def.description,
		schema: schema,
	};
};

interface XrpcError {
	name: string;
	description?: string;
}
// #endregion

// #region Sub-types
/**
 * builder definition for XRPC query parameters
 */
export interface LexXrpcParametersBuilder extends Annotations {
	type: 'params';
	/** query parameters limited to primitives and arrays */
	properties?: Record<string, MaybeFieldWrapper<LexPrimitiveBuilder | LexPrimitiveArrayBuilder>>;
}

/**
 * builds a params definition
 * @param def optional params definition options
 * @returns params builder definition
 */
export const params = (def?: Omit<LexXrpcParametersBuilder, 'type'>): LexXrpcParametersBuilder => {
	return { ...def, type: 'params' };
};

const buildXrpcParametersSchema = (ctx: BuildContext, def: LexXrpcParametersBuilder): t.LexXrpcParameters => {
	const properties: Record<string, t.LexPrimitive | t.LexPrimitiveArray> = {};
	const required: string[] = [];

	if (def.properties) {
		for (const [prop, propDef] of Object.entries(def.properties)) {
			let unwrapped: LexPrimitiveBuilder | LexPrimitiveArrayBuilder;
			let isRequired = false;

			if (propDef.type === 'field-wrapper') {
				unwrapped = propDef.wrapped;
				isRequired = propDef.required;
			} else {
				unwrapped = propDef;
			}

			if (isRequired) {
				required.push(prop);
			}

			properties[prop] = buildFieldSchema(delve(ctx, prop), unwrapped) as
				| t.LexPrimitive
				| t.LexPrimitiveArray;
		}
	}

	return {
		description: def.description,
		properties: Object.keys(properties).length > 0 ? properties : undefined,
		required: required.length > 0 ? required : undefined,
		type: 'params',
	};
};

export type RepoAction = 'create' | 'update' | 'delete';

/**
 * builder definition for repository permissions
 */
export interface LexRepoPermissionBuilder {
	type: 'repo-permission';
	/** collections this permission covers */
	collection: (Nsid | LexRecordBuilder)[];
	/** allowed actions; if omitted, all operations are permitted */
	action?: RepoAction[];
}

/**
 * builds a repository permission definition
 * @param def permission definition parameters
 * @returns repository permission builder definition
 */
export const repoPermission = (def: Omit<LexRepoPermissionBuilder, 'type'>): LexRepoPermissionBuilder => {
	const { collection } = def;

	if (collection.length === 0) {
		throw new Error(`repo-permission/collection: value can't be empty`);
	}

	return { ...def, type: 'repo-permission' };
};

/**
 * builder definition for rpc permissions
 */
export interface LexRpcPermissionBuilder {
	type: 'rpc-permission';
	/** allowed rpc methods */
	lxm: (Nsid | LexXrpcQueryBuilder | LexXrpcProcedureBuilder | LexXrpcSubscriptionBuilder)[];
	/** audience */
	aud?: '*';
	/** inherit the audience from the including permission scope */
	inheritAud?: boolean;
}

/**
 * builds an rpc permission definition
 * @param def permission definition parameters
 * @returns rpc permission builder definition
 */
export const rpcPermission = (def: Omit<LexRpcPermissionBuilder, 'type'>): LexRpcPermissionBuilder => {
	const { lxm, aud, inheritAud = false } = def;

	if (lxm.length === 0) {
		throw new Error(`rpc-permission/lxm: value can't be empty`);
	}

	if (inheritAud) {
		if (aud !== undefined) {
			throw new Error(`rpc-permission: aud can't be set when inheritAud is enabled`);
		}
	} else if (aud === undefined) {
		throw new Error(`rpc-permission: aud must be set when inheritAud is disabled`);
	}

	return { ...def, type: 'rpc-permission' };
};

export type LexPermissionBuilder = LexRepoPermissionBuilder | LexRpcPermissionBuilder;

const buildPermissionSchema = (ctx: BuildContext, def: LexPermissionBuilder): t.LexPermission => {
	switch (def.type) {
		case 'repo-permission': {
			const { collection, action } = def;

			const builtCollection = collection.map((item, index) => {
				if (typeof item === 'string') {
					return item;
				}

				const defPath = ctx.toplevelDefs.get(item);
				if (defPath === undefined) {
					throw new Error(`${ctx.dotPath}/collection/${index}: must be defined as a top-level definition`);
				}

				return toLexUri(defPath);
			});

			return {
				action: action,
				collection: builtCollection,
				resource: 'repo',
				type: 'permission',
			};
		}
		case 'rpc-permission': {
			const { lxm, aud, inheritAud } = def;

			const builtLxm = lxm.map((item, index) => {
				if (typeof item === 'string') {
					return item;
				}

				const defPath = ctx.toplevelDefs.get(item);
				if (defPath === undefined) {
					throw new Error(`${ctx.dotPath}/lxm/${index}: must be defined as a top-level definition`);
				}

				return toLexUri(defPath);
			});

			return {
				aud: aud,
				inheritAud: inheritAud,
				lxm: builtLxm,
				resource: 'rpc',
				type: 'permission',
			};
		}
	}
};
// #endregion

// #region Primary types
/**
 * builder definition for a record object
 */
export interface LexRecordBuilder extends Annotations {
	type: 'record';
	/** record key type */
	key?: 'tid' | 'nsid' | 'any' | `literal:${string}`;
	/** object schema for the record */
	record: LexObjectBuilder;
}

/**
 * builds a record definition
 * @param def record definition parameters
 * @returns record builder definition
 */
export const record = (def: Omit<LexRecordBuilder, 'type'>): LexRecordBuilder => {
	return { ...def, type: 'record' };
};

const buildRecordSchema = (ctx: BuildContext, def: LexRecordBuilder): t.LexRecord => {
	return {
		description: def.description,
		key: def.key,
		record: buildObjectSchema(delve(ctx, 'record'), def.record),
		type: 'record',
	};
};

/**
 * builder definition for an XRPC query endpoint
 */
export interface LexXrpcQueryBuilder extends Annotations {
	type: 'query';
	/** HTTP query parameters */
	parameters?: LexXrpcParametersBuilder;
	/** response body definition */
	output?: XrpcBody;
	/** possible errors */
	errors?: XrpcError[];
}

/**
 * builds a query definition
 * @param def optional query definition options
 * @returns query builder definition
 */
export const query = (def: Omit<LexXrpcQueryBuilder, 'type'> = {}): LexXrpcQueryBuilder => {
	const { output } = def;

	if (output !== undefined) {
		const encoding = output.encoding;

		if (!DELIMITED_MIME_TYPE_RE.test(encoding)) {
			throw new Error(`query/output/encoding: value must be a comma-delimited list of MIME types`);
		}
	}

	return { ...def, type: 'query' };
};

const buildQuerySchema = (ctx: BuildContext, def: LexXrpcQueryBuilder): t.LexXrpcQuery => {
	return {
		description: def.description,
		errors: def.errors,
		output: def.output ? buildXrpcBodySchema(delve(ctx, 'output'), def.output) : undefined,
		parameters: def.parameters
			? buildXrpcParametersSchema(delve(ctx, 'parameters'), def.parameters)
			: undefined,
		type: 'query',
	};
};

/**
 * builder definition for an XRPC procedure endpoint
 */
export interface LexXrpcProcedureBuilder extends Annotations {
	type: 'procedure';
	/** HTTP query parameters */
	parameters?: LexXrpcParametersBuilder;
	/** request body definition */
	input?: XrpcBody;
	/** response body definition */
	output?: XrpcBody;
	/** possible errors */
	errors?: XrpcError[];
}

/**
 * builds a procedure definition
 * @param def optional procedure definition options
 * @returns procedure builder definition
 */
export const procedure = (def: Omit<LexXrpcProcedureBuilder, 'type'> = {}): LexXrpcProcedureBuilder => {
	const { input, output } = def;

	if (input !== undefined) {
		const encoding = input.encoding;

		if (!DELIMITED_MIME_TYPE_RE.test(encoding)) {
			throw new Error(`procedure/input/encoding: value must be a comma-delimited list of MIME types`);
		}
	}

	if (output !== undefined) {
		const encoding = output.encoding;

		if (!DELIMITED_MIME_TYPE_RE.test(encoding)) {
			throw new Error(`procedure/output/encoding: value must be a comma-delimited list of MIME types`);
		}
	}

	return { ...def, type: 'procedure' };
};

const buildProcedureSchema = (ctx: BuildContext, def: LexXrpcProcedureBuilder): t.LexXrpcProcedure => {
	return {
		description: def.description,
		errors: def.errors,
		input: def.input ? buildXrpcBodySchema(delve(ctx, 'input'), def.input) : undefined,
		output: def.output ? buildXrpcBodySchema(delve(ctx, 'output'), def.output) : undefined,
		parameters: def.parameters
			? buildXrpcParametersSchema(delve(ctx, 'parameters'), def.parameters)
			: undefined,
		type: 'procedure',
	};
};

/**
 * builder definition for an XRPC subscription endpoint
 */
export interface LexXrpcSubscriptionBuilder extends Annotations {
	type: 'subscription';
	/** HTTP query parameters */
	parameters?: LexXrpcParametersBuilder;
	/** event message definition */
	message?: XrpcSubscriptionMessage;
	/** possible errors */
	errors?: XrpcError[];
}

/**
 * builds a subscription definition
 * @param def optional subscription definition options
 * @returns subscription builder definition
 */
export const subscription = (def?: Omit<LexXrpcSubscriptionBuilder, 'type'>): LexXrpcSubscriptionBuilder => {
	return { ...def, type: 'subscription' };
};

const buildSubscriptionSchema = (
	ctx: BuildContext,
	def: LexXrpcSubscriptionBuilder,
): t.LexXrpcSubscription => {
	return {
		description: def.description,
		errors: def.errors,
		message: def.message ? buildSubscriptionMessageSchema(delve(ctx, 'message'), def.message) : undefined,
		parameters: def.parameters
			? buildXrpcParametersSchema(delve(ctx, 'parameters'), def.parameters)
			: undefined,
		type: 'subscription',
	};
};

/**
 * builder definition for a permission set
 */
export interface LexPermissionSetBuilder extends Annotations {
	type: 'permission-set';
	/** short title for the permission set */
	title?: string;
	/** localized titles */
	'title:lang'?: t.LexLang;
	/** detailed description of the permission set */
	detail?: string;
	/** localized details */
	'detail:lang'?: t.LexLang;
	/** permission entries in this set */
	permissions: LexPermissionBuilder[];
}

/**
 * builds a permission set definition
 * @param def permission set definition parameters
 * @returns permission set builder definition
 */
export const permissionSet = (def: Omit<LexPermissionSetBuilder, 'type'>): LexPermissionSetBuilder => {
	const { permissions } = def;

	if (permissions.length === 0) {
		throw new Error(`permission-set/permissions: array can't be empty`);
	}

	return { ...def, type: 'permission-set' };
};

const buildPermissionSetSchema = (ctx: BuildContext, def: LexPermissionSetBuilder): t.LexPermissionSet => {
	return {
		description: def.description,
		'detail:lang': def['detail:lang'],
		detail: def.detail,
		permissions: def.permissions.map((perm, index) => {
			return buildPermissionSchema(delve(ctx, `permissions/${index}`), perm);
		}),
		'title:lang': def['title:lang'],
		title: def.title,
		type: 'permission-set',
	};
};

// #region Document
type MainType =
	| LexRecordBuilder
	| LexXrpcQueryBuilder
	| LexXrpcProcedureBuilder
	| LexXrpcSubscriptionBuilder
	| LexPermissionSetBuilder;

type DefType = LexConcreteBuilder | LexTokenBuilder | LexUnknownBuilder | LexContainerBuilder;

/**
 * builder definition for a lexicon document
 */
export interface LexDocumentBuilder {
	/** nsid for this document */
	id: Nsid;
	/** optional revision number */
	revision?: number;
	/** short description of the document */
	description?: string;
	/** named definitions within the document */
	defs: Record<string, MainType | DefType>;
}

/**
 * validates a lexicon document definition
 * @param doc document definition parameters
 * @returns lexicon document builder definition
 */
export const document = (doc: LexDocumentBuilder): LexDocumentBuilder => {
	const { defs } = doc;

	for (const defId in defs) {
		if (!KEY_RE.test(defId)) {
			throw new Error(`${doc.id}/defs: invalid "${defId}" definition id`);
		}

		const def = defs[defId];

		if (
			defId !== 'main' &&
			(def.type === 'record' ||
				def.type === 'query' ||
				def.type === 'procedure' ||
				def.type === 'subscription' ||
				def.type === 'permission-set')
		) {
			throw new Error(`${doc.id}#${defId}: ${def.type} must be the main definition`);
		}
	}

	return doc;
};

const collectToplevelDefs = (documents: LexDocumentBuilder[]): Map<DefType | MainType, LexPath> => {
	const map = new Map<DefType | MainType, LexPath>();

	for (const doc of documents) {
		for (const [defId, defValue] of Object.entries(doc.defs)) {
			map.set(defValue, { nsid: doc.id, defId });
		}
	}

	return map;
};

const buildDefSchema = (ctx: BuildContext, def: MainType | DefType): t.LexUserType => {
	switch (def.type) {
		// Primary
		case 'record': {
			return buildRecordSchema(ctx, def);
		}
		case 'query': {
			return buildQuerySchema(ctx, def);
		}
		case 'procedure': {
			return buildProcedureSchema(ctx, def);
		}
		case 'subscription': {
			return buildSubscriptionSchema(ctx, def);
		}
		case 'permission-set': {
			return buildPermissionSetSchema(ctx, def);
		}

		// Concrete
		case 'boolean': {
			return buildBooleanSchema(ctx, def);
		}
		case 'integer': {
			return buildIntegerSchema(ctx, def);
		}
		case 'string': {
			return buildStringSchema(ctx, def);
		}
		case 'bytes': {
			return buildBytesSchema(ctx, def);
		}
		case 'cid-link': {
			return buildCidLinkSchema(ctx, def);
		}
		case 'blob': {
			return buildBlobSchema(ctx, def);
		}

		// Meta
		case 'token': {
			return buildTokenSchema(ctx, def);
		}
		case 'unknown': {
			return buildUnknownSchema(ctx, def);
		}

		// Container
		case 'object': {
			return buildObjectSchema(ctx, def);
		}
		case 'array': {
			return buildArraySchema(ctx, def);
		}
	}
};

/**
 * builds lexicon documents into lexicon JSON schema objects
 * @param options collection of document builders to compile
 * @returns map of nsid to compiled lexicon document
 */
export const build = (options: { documents: LexDocumentBuilder[] }): Record<string, t.LexiconDoc> => {
	const documents = options.documents;

	const toplevelDefs = collectToplevelDefs(documents);
	const result: Record<string, t.LexiconDoc> = {};

	for (const doc of documents) {
		const defs: Record<string, t.LexUserType> = {};

		for (const [defId, defValue] of Object.entries(doc.defs)) {
			const ctx: BuildContext = {
				toplevelDefs,
				lexPath: { nsid: doc.id, defId },
				dotPath: `${doc.id}#${defId}`,
			};

			defs[defId] = buildDefSchema(ctx, defValue);
		}

		result[doc.id] = {
			defs: defs,
			description: doc.description,
			id: doc.id,
			lexicon: 1,
			revision: doc.revision,
		};
	}

	return result;
};
// #endregion
