import type { AtprotoAudience, Nsid } from '@atcute/lexicons/syntax';

import type {
	LexArray,
	LexBlob,
	LexBoolean,
	LexBytes,
	LexCidLink,
	LexInteger,
	LexIpldType,
	LexLang,
	LexObject,
	LexPermission,
	LexPermissionSet,
	LexPrimitive,
	LexPrimitiveArray,
	LexRecord,
	LexRef,
	LexRefUnion,
	LexRefVariant,
	LexString,
	LexStringFormat,
	LexToken,
	LexUnknown,
	LexUserType,
	LexXrpcBody,
	LexXrpcParameters,
	LexXrpcProcedure,
	LexXrpcQuery,
	LexXrpcSubscription,
	LexXrpcSubscriptionMessage,
	LexiconDoc,
} from './types.js';

import { isWithinGraphemeBounds, isWithinUtf8Bounds } from './internal/utils.js';

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

const getReference = (ctx: BuildContext, def: DefType | MainType): LexRef | undefined => {
	const defPath = ctx.toplevelDefs.get(def);
	if (defPath === undefined) {
		return undefined;
	}

	return {
		type: 'ref',
		ref: toLexUri(defPath, ctx.lexPath),
	};
};

const requireReference = (ctx: BuildContext, def: DefType | MainType): LexRef => {
	const ref = getReference(ctx, def);
	if (ref === undefined) {
		throw new Error(`${ctx.dotPath} cannot be found as a top-level definition anywhere`);
	}

	return ref;
};

export type Annotations = {
	description?: string;
};

export interface LexBooleanBuilder extends Annotations {
	type: 'boolean';
	default?: boolean;
	const?: boolean;
}

export const boolean = (def: Omit<LexBooleanBuilder, 'type'> = {}): LexBooleanBuilder => {
	const { const: constValue, default: defaultValue } = def;

	if (defaultValue !== undefined) {
		if (constValue !== undefined && defaultValue !== constValue) {
			throw new Error(`boolean: default value must match const value`);
		}
	}

	return { ...def, type: 'boolean' };
};

const buildBooleanSchema = (_ctx: BuildContext, def: LexBooleanBuilder): LexBoolean => {
	return {
		const: def.const,
		default: def.default,
		description: def.description,
		type: 'boolean',
	};
};

export interface LexIntegerBuilder extends Annotations {
	type: 'integer';
	default?: number;
	minimum?: number;
	maximum?: number;
	enum?: number[];
	const?: number;
}

export const integer = (def: Omit<LexIntegerBuilder, 'type'> = {}): LexIntegerBuilder => {
	const { minimum = 0, maximum = Infinity, const: constValue, default: defaultValue, enum: enumValues } = def;

	if (minimum > maximum) {
		throw new Error(`integer: minimum value (${minimum}) can't be greater than maximum value (${maximum})`);
	}

	if (defaultValue !== undefined) {
		if (constValue !== undefined && defaultValue !== constValue) {
			throw new Error(`integer: default value must match const value`);
		}

		if (enumValues !== undefined && !enumValues.includes(defaultValue)) {
			throw new Error(`integer: default value must be one of the enum values`);
		}

		if (defaultValue < minimum) {
			throw new Error(
				`integer: default value (${defaultValue}) can't be lower than minimum value (${minimum})`,
			);
		}

		if (defaultValue > maximum) {
			throw new Error(
				`integer: default value (${defaultValue}) can't be greater than maximum value (${maximum})`,
			);
		}
	}

	if (constValue !== undefined) {
		if (enumValues !== undefined) {
			throw new Error(`integer: const and enum can't be used together`);
		}

		if (constValue < minimum) {
			throw new Error(`integer: const value (${constValue}) can't be lower than minimum value (${minimum})`);
		}

		if (constValue > maximum) {
			throw new Error(
				`integer: const value (${constValue}) can't be greater than maximum value (${maximum})`,
			);
		}
	}

	if (enumValues !== undefined) {
		for (let idx = 0, len = enumValues.length; idx < len; idx++) {
			const enumValue = enumValues[idx];

			if (enumValue < minimum) {
				throw new Error(
					`integer: enum[${idx}] (${enumValue}) can't be lower than minimum value (${minimum})`,
				);
			}

			if (enumValue > maximum) {
				throw new Error(
					`integer: enum[${idx}] (${enumValue}) can't be greater than maximum value (${maximum})`,
				);
			}
		}
	}

	return { ...def, type: 'integer' };
};

const buildIntegerSchema = (_ctx: BuildContext, def: LexIntegerBuilder): LexInteger => {
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

export interface LexStringBuilder extends Annotations {
	type: 'string';
	format?: LexStringFormat;
	default?: string | LexTokenBuilder;
	minLength?: number;
	maxLength?: number;
	minGraphemes?: number;
	maxGraphemes?: number;
	enum?: (string | LexTokenBuilder)[];
	const?: string | LexTokenBuilder;
	knownValues?: (string | LexTokenBuilder)[];
}

export const string = (def: Omit<LexStringBuilder, 'type'> = {}): LexStringBuilder => {
	const {
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
			`string: minimum length (${minLength}) can't be greater than maximum length (${maxLength})`,
		);
	}

	if (minGraphemes > maxGraphemes) {
		throw new Error(
			`string: minimum graphemes (${minGraphemes}) can't be greater than maximum graphemes (${maxGraphemes})`,
		);
	}

	if (defaultValue !== undefined && typeof defaultValue === 'string') {
		if (constValue !== undefined && typeof constValue === 'string' && defaultValue !== constValue) {
			throw new Error(`string: default value must match const value`);
		}

		if (enumValues !== undefined) {
			const allStrings = enumValues.every((v) => typeof v === 'string');
			if (allStrings && !enumValues.includes(defaultValue)) {
				throw new Error(`string: default value must be one of the enum values`);
			}
		}

		{
			const bound = isWithinUtf8Bounds(defaultValue, minLength, maxLength);

			if (bound === 'min') {
				throw new Error(
					`string: default value (${JSON.stringify(defaultValue)}) can't be shorter than minimum length (${minLength})`,
				);
			}

			if (bound === 'max') {
				throw new Error(
					`string: default value (${JSON.stringify(defaultValue)}) can't be longer than maximum length (${maxLength})`,
				);
			}
		}

		{
			const bound = isWithinGraphemeBounds(defaultValue, minGraphemes, maxGraphemes);

			if (bound === 'min') {
				throw new Error(
					`string: default value (${JSON.stringify(defaultValue)}) can't be shorter than minimum graphemes (${minGraphemes})`,
				);
			}

			if (bound === 'max') {
				throw new Error(
					`string: default value (${JSON.stringify(defaultValue)}) can't be longer than maximum graphemes (${maxGraphemes})`,
				);
			}
		}
	}

	if (constValue !== undefined) {
		if (enumValues !== undefined) {
			throw new Error(`string: const and enum can't be used together`);
		}

		if (knownValues !== undefined) {
			throw new Error(`string: const and knownValues can't be used together`);
		}

		if (typeof constValue === 'string') {
			{
				const bound = isWithinUtf8Bounds(constValue, minLength, maxLength);

				if (bound === 'min') {
					throw new Error(
						`string: const value (${JSON.stringify(constValue)}) can't be shorter than minimum length (${minLength})`,
					);
				}

				if (bound === 'max') {
					throw new Error(
						`string: const value (${JSON.stringify(constValue)}) can't be longer than maximum length (${maxLength})`,
					);
				}
			}

			{
				const bound = isWithinGraphemeBounds(constValue, minGraphemes, maxGraphemes);

				if (bound === 'min') {
					throw new Error(
						`string: const value (${JSON.stringify(constValue)}) can't be shorter than minimum graphemes (${minGraphemes})`,
					);
				}

				if (bound === 'max') {
					throw new Error(
						`string: const value (${JSON.stringify(constValue)}) can't be longer than maximum graphemes (${maxGraphemes})`,
					);
				}
			}
		}
	}

	if (enumValues !== undefined) {
		if (knownValues !== undefined) {
			throw new Error(`string: enum and knownValues can't be used together`);
		}

		for (let idx = 0, len = enumValues.length; idx < len; idx++) {
			const enumValue = enumValues[idx];

			if (typeof enumValue === 'string') {
				{
					const bound = isWithinUtf8Bounds(enumValue, minLength, maxLength);

					if (bound === 'min') {
						throw new Error(
							`string: enum[${idx}] (${JSON.stringify(enumValue)}) can't be shorter than minimum length (${minLength})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`string: enum[${idx}] (${JSON.stringify(enumValue)}) can't be longer than maximum length (${maxLength})`,
						);
					}
				}

				{
					const bound = isWithinGraphemeBounds(enumValue, minGraphemes, maxGraphemes);

					if (bound === 'min') {
						throw new Error(
							`string: enum[${idx}] (${JSON.stringify(enumValue)}) can't have fewer graphemes than minimum graphemes (${minGraphemes})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`string: enum[${idx}] (${JSON.stringify(enumValue)}) can't have more graphemes than maximum graphemes (${maxGraphemes})`,
						);
					}
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
							`string: knownValues[${idx}] (${JSON.stringify(knownValue)}) can't be shorter than minimum length (${minLength})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`string: knownValues[${idx}] (${JSON.stringify(knownValue)}) can't be longer than maximum length (${maxLength})`,
						);
					}
				}

				{
					const bound = isWithinGraphemeBounds(knownValue, minGraphemes, maxGraphemes);

					if (bound === 'min') {
						throw new Error(
							`string: knownValues[${idx}] (${JSON.stringify(knownValue)}) can't have fewer graphemes than minimum graphemes (${minGraphemes})`,
						);
					}

					if (bound === 'max') {
						throw new Error(
							`string: knownValues[${idx}] (${JSON.stringify(knownValue)}) can't have more graphemes than maximum graphemes (${maxGraphemes})`,
						);
					}
				}
			}
		}
	}

	return { ...def, type: 'string' };
};

const resolveStringTokenReference = (ctx: BuildContext, def: LexTokenBuilder): string => {
	const defPath = ctx.toplevelDefs.get(def);
	if (defPath === undefined) {
		throw new Error(`${ctx.dotPath} is referencing an undefined token`);
	}

	// don't use the relative path here
	return toLexUri(defPath);
};

const buildStringSchema = (ctx: BuildContext, def: LexStringBuilder): LexString => {
	const {
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
			}
		}
	}

	return {
		type: 'string',
		const: builtConstValue,
		default: builtDefaultValue,
		enum: builtEnumValues,
		format: def.format,
		knownValues: builtKnownValues,
		maxGraphemes: def.maxGraphemes,
		maxLength: def.maxLength,
		minGraphemes: def.minGraphemes,
		minLength: def.minLength,
	};
};

export interface LexUnknownBuilder extends Annotations {
	type: 'unknown';
}

export const unknown = (def?: Omit<LexUnknownBuilder, 'type'>): LexUnknownBuilder => {
	return { ...def, type: 'unknown' };
};

const buildUnknownSchema = (_ctx: BuildContext, def: LexUnknownBuilder): LexUnknown => {
	return {
		description: def.description,
		type: 'unknown',
	};
};

type LexPrimitiveBuilder = LexBooleanBuilder | LexIntegerBuilder | LexStringBuilder | LexUnknownBuilder;

export interface LexBytesBuilder extends Annotations {
	type: 'bytes';
	minLength?: number;
	maxLength?: number;
}

export const bytes = (def: Omit<LexBytesBuilder, 'type'> = {}): LexBytesBuilder => {
	const { minLength = 0, maxLength = Infinity } = def;

	if (minLength > maxLength) {
		throw new Error(
			`bytes: minimum length (${minLength}) can't be greater than maximum length (${maxLength})`,
		);
	}

	return { ...def, type: 'bytes' };
};

const buildBytesSchema = (_ctx: BuildContext, def: LexBytesBuilder): LexBytes => {
	return {
		description: def.description,
		maxLength: def.maxLength,
		minLength: def.minLength,
		type: 'bytes',
	};
};

export interface LexCidLinkBuilder extends Annotations {
	type: 'cid-link';
}

export const cidLink = (def?: Omit<LexCidLinkBuilder, 'type'>): LexCidLinkBuilder => {
	return { ...def, type: 'cid-link' };
};

const buildCidLinkSchema = (_ctx: BuildContext, def: LexCidLinkBuilder): LexCidLink => {
	return {
		description: def.description,
		type: 'cid-link',
	};
};

type LexIpldBuilder = LexBytesBuilder | LexCidLinkBuilder;

export interface LexBlobBuilder extends Annotations {
	type: 'blob';
	accept?: string[];
	maxSize?: number;
}

export const blob = (def?: Omit<LexBlobBuilder, 'type'>): LexBlobBuilder => {
	return { ...def, type: 'blob' };
};

const buildBlobSchema = (_ctx: BuildContext, def: LexBlobBuilder): LexBlob => {
	return {
		accept: def.accept,
		description: def.description,
		maxSize: def.maxSize,
		type: 'blob',
	};
};

export interface LexTokenBuilder extends Annotations {
	type: 'token';
}

export const token = (def?: Omit<LexTokenBuilder, 'type'>): LexTokenBuilder => {
	return { ...def, type: 'token' };
};

const buildTokenSchema = (_ctx: BuildContext, def: LexTokenBuilder): LexToken => {
	return {
		description: def.description,
		type: 'token',
	};
};

export interface LexRefBuilder extends Annotations {
	type: 'ref';
	ref: string;
}

export const ref = (def: Omit<LexRefBuilder, 'type'>): LexRefBuilder => {
	return { ...def, type: 'ref' };
};

const buildRefSchema = (_ctx: BuildContext, def: LexRefBuilder): LexRef => {
	return {
		description: def.description,
		ref: def.ref,
		type: 'ref',
	};
};

export interface LexRefUnionBuilder extends Annotations {
	type: 'union';
	refs: Array<
		// referable
		| LexObjectBuilder
		// inlinable
		| LexRefBuilder
	>;
	closed?: boolean;
}

export const union = (def: Omit<LexRefUnionBuilder, 'type'>): LexRefUnionBuilder => {
	const { refs, closed = false } = def;

	if (closed) {
		if (refs.length === 0) {
			throw new Error(`union: closed unions can't have zero ref members`);
		}
	}

	return { ...def, type: 'union' };
};

const buildUnionSchema = (ctx: BuildContext, def: LexRefUnionBuilder): LexRefUnion => {
	return {
		closed: def.closed,
		description: def.description,
		refs: def.refs.map((item, index) => {
			if (item.type === 'ref') {
				return item.ref;
			}

			const defPath = ctx.toplevelDefs.get(item);
			if (defPath === undefined) {
				throw new Error(`${ctx.dotPath}/refs/${index} must be defined as a top-level definition`);
			}

			return toLexUri(defPath, ctx.lexPath);
		}),
		type: 'union',
	};
};

type LexRefVariantBuilder = LexRefBuilder | LexRefUnionBuilder;

type ArrayItem =
	// referable
	| LexObjectBuilder
	| LexTokenBuilder
	| LexArrayBuilder
	// inlinable
	| LexPrimitiveBuilder
	| LexIpldBuilder
	| LexRefVariantBuilder
	| LexBlobBuilder;

export interface LexArrayBuilder<TItems extends ArrayItem = ArrayItem> extends Annotations {
	type: 'array';
	items: TItems;
	minLength?: number;
	maxLength?: number;
}

export const array = <TItems extends ArrayItem>(
	def: Omit<LexArrayBuilder<TItems>, 'type'>,
): LexArrayBuilder<TItems> => {
	const { minLength = 0, maxLength = Infinity } = def;

	if (minLength > maxLength) {
		throw new Error(
			`array: minimum length (${minLength}) can't be greater than maximum length (${maxLength})`,
		);
	}

	return { ...def, type: 'array' };
};

const buildArraySchema = (ctx: BuildContext, def: LexArrayBuilder): LexArray => {
	const itemsCtx = delve(ctx, 'items');
	const items = def.items;
	let builtItems: LexArray['items'];

	switch (items.type) {
		case 'ref': {
			builtItems = buildRefSchema(itemsCtx, items);
			break;
		}
		case 'union': {
			builtItems = buildUnionSchema(itemsCtx, items);
			break;
		}

		case 'array':
		case 'object':
		case 'token': {
			builtItems = requireReference(itemsCtx, items);
			break;
		}

		case 'boolean': {
			builtItems = getReference(itemsCtx, items) ?? buildBooleanSchema(itemsCtx, items);
			break;
		}
		case 'integer': {
			builtItems = getReference(itemsCtx, items) ?? buildIntegerSchema(itemsCtx, items);
			break;
		}
		case 'string': {
			builtItems = getReference(itemsCtx, items) ?? buildStringSchema(itemsCtx, items);
			break;
		}
		case 'unknown': {
			builtItems = getReference(itemsCtx, items) ?? buildUnknownSchema(itemsCtx, items);
			break;
		}
		case 'bytes': {
			builtItems = getReference(itemsCtx, items) ?? buildBytesSchema(itemsCtx, items);
			break;
		}
		case 'cid-link': {
			builtItems = getReference(itemsCtx, items) ?? buildCidLinkSchema(itemsCtx, items);
			break;
		}
		case 'blob': {
			builtItems = getReference(itemsCtx, items) ?? buildBlobSchema(itemsCtx, items);
			break;
		}
	}

	return {
		description: def.description,
		items: builtItems,
		maxLength: def.maxLength,
		minLength: def.minLength,
		type: 'array',
	};
};

type ObjectItem =
	// referable
	| LexObjectBuilder
	| LexTokenBuilder
	// inlinable
	| LexArrayBuilder
	| LexPrimitiveBuilder
	| LexIpldBuilder
	| LexRefVariantBuilder
	| LexBlobBuilder;

export interface LexObjectBuilder extends Annotations {
	type: 'object';
	properties?: Record<string, MaybeFieldWrapper<ObjectItem>>;
}

const wrapField = <T extends DefType | LexRefVariantBuilder>(
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

export const object = (def?: Omit<LexObjectBuilder, 'type'>): LexObjectBuilder => {
	return { ...def, type: 'object' };
};

const buildObjectSchema = (ctx: BuildContext, def: LexObjectBuilder): LexObject => {
	const properties: Record<string, LexArray | LexPrimitive | LexIpldType | LexRefVariant | LexBlob> = {};
	const required: string[] = [];
	const nullable: string[] = [];

	if (def.properties) {
		for (const [key, prop] of Object.entries(def.properties)) {
			const propCtx = delve(ctx, key);
			let unwrapped: Exclude<typeof prop, FieldWrapper<any>>;
			let isRequired = false;
			let isNullable = false;

			if (prop.type === 'field-wrapper') {
				unwrapped = prop.wrapped;
				isRequired = prop.required;
				isNullable = prop.nullable;
			} else {
				unwrapped = prop;
			}

			if (isRequired) {
				required.push(key);
			}
			if (isNullable) {
				nullable.push(key);
			}

			let builtProp: LexArray | LexPrimitive | LexIpldType | LexRefVariant | LexBlob;

			switch (unwrapped.type) {
				case 'ref': {
					builtProp = buildRefSchema(propCtx, unwrapped);
					break;
				}
				case 'union': {
					builtProp = buildUnionSchema(propCtx, unwrapped);
					break;
				}

				case 'object':
				case 'token': {
					builtProp = requireReference(propCtx, unwrapped);
					break;
				}

				case 'boolean': {
					builtProp = getReference(propCtx, unwrapped) ?? buildBooleanSchema(propCtx, unwrapped);
					break;
				}
				case 'integer': {
					builtProp = getReference(propCtx, unwrapped) ?? buildIntegerSchema(propCtx, unwrapped);
					break;
				}
				case 'string': {
					builtProp = getReference(propCtx, unwrapped) ?? buildStringSchema(propCtx, unwrapped);
					break;
				}
				case 'unknown': {
					builtProp = getReference(propCtx, unwrapped) ?? buildUnknownSchema(propCtx, unwrapped);
					break;
				}
				case 'bytes': {
					builtProp = getReference(propCtx, unwrapped) ?? buildBytesSchema(propCtx, unwrapped);
					break;
				}
				case 'cid-link': {
					builtProp = getReference(propCtx, unwrapped) ?? buildCidLinkSchema(propCtx, unwrapped);
					break;
				}
				case 'blob': {
					builtProp = getReference(propCtx, unwrapped) ?? buildBlobSchema(propCtx, unwrapped);
					break;
				}

				case 'array': {
					builtProp = getReference(propCtx, unwrapped) ?? buildArraySchema(propCtx, unwrapped);
					break;
				}
			}

			properties[key] = builtProp;
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

export const required = <T extends DefType | LexRefVariantBuilder>(
	def: MaybeFieldWrapper<T>,
): FieldWrapper<T> => {
	if (def.type === 'field-wrapper') {
		return wrapField(def.wrapped, true, def.nullable);
	}

	return wrapField(def, true, false);
};

export const nullable = <T extends DefType | LexRefVariantBuilder>(
	def: MaybeFieldWrapper<T>,
): FieldWrapper<T> => {
	if (def.type === 'field-wrapper') {
		return wrapField(def.wrapped, def.required, true);
	}

	return wrapField(def, false, true);
};

type LexPrimitiveArrayBuilder = LexArrayBuilder<LexPrimitiveBuilder>;

export interface LexXrpcParametersBuilder extends Annotations {
	type: 'params';
	properties?: Record<string, MaybeFieldWrapper<LexPrimitiveBuilder | LexPrimitiveArrayBuilder>>;
}

export const params = (def?: Omit<LexXrpcParametersBuilder, 'type'>): LexXrpcParametersBuilder => {
	return { ...def, type: 'params' };
};

const buildXrpcParametersSchema = (ctx: BuildContext, def: LexXrpcParametersBuilder): LexXrpcParameters => {
	const properties: Record<string, LexPrimitive | LexPrimitiveArray> = {};
	const required: string[] = [];

	if (def.properties) {
		for (const [key, prop] of Object.entries(def.properties)) {
			const propCtx = delve(ctx, key);
			let unwrapped: Exclude<typeof prop, FieldWrapper<any>>;
			let isRequired = false;

			if (prop.type === 'field-wrapper') {
				unwrapped = prop.wrapped;
				isRequired = prop.required;
			} else {
				unwrapped = prop;
			}

			if (isRequired) {
				required.push(key);
			}

			let builtProp: LexPrimitive | LexPrimitiveArray;

			switch (unwrapped.type) {
				case 'boolean': {
					builtProp = buildBooleanSchema(propCtx, unwrapped);
					break;
				}
				case 'integer': {
					builtProp = buildIntegerSchema(propCtx, unwrapped);
					break;
				}
				case 'string': {
					builtProp = buildStringSchema(propCtx, unwrapped);
					break;
				}
				case 'unknown': {
					builtProp = buildUnknownSchema(propCtx, unwrapped);
					break;
				}
				case 'array': {
					builtProp = buildArraySchema(propCtx, unwrapped) as LexPrimitiveArray;
					break;
				}
			}

			properties[key] = builtProp;
		}
	}

	return {
		description: def.description,
		properties: Object.keys(properties).length > 0 ? properties : undefined,
		required: required.length > 0 ? required : undefined,
		type: 'params',
	};
};

interface XrpcBody extends Annotations {
	encoding: string;
	schema?: LexRefVariantBuilder | LexObjectBuilder;
}

const buildXrpcBodySchema = (ctx: BuildContext, def: XrpcBody): LexXrpcBody => {
	let schema: LexXrpcBody['schema'] | undefined;

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

interface XrpcError {
	name: string;
	description?: string;
}

interface XrpcSubscriptionMessage extends Annotations {
	schema?: LexRefVariantBuilder | LexObjectBuilder;
}

const buildSubscriptionMessageSchema = (
	ctx: BuildContext,
	def: XrpcSubscriptionMessage,
): LexXrpcSubscriptionMessage => {
	let schema: LexXrpcSubscriptionMessage['schema'] | undefined;

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
		schema: schema,
	};
};

export interface LexXrpcQueryBuilder extends Annotations {
	type: 'query';
	parameters?: LexXrpcParametersBuilder;
	output?: XrpcBody;
	errors?: XrpcError[];
}

export const query = (def?: Omit<LexXrpcQueryBuilder, 'type'>): LexXrpcQueryBuilder => {
	return { ...def, type: 'query' };
};

const buildQuerySchema = (ctx: BuildContext, def: LexXrpcQueryBuilder): LexXrpcQuery => {
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

export interface LexXrpcProcedureBuilder extends Annotations {
	type: 'procedure';
	parameters?: LexXrpcParametersBuilder;
	input?: XrpcBody;
	output?: XrpcBody;
	errors?: XrpcError[];
}

export const procedure = (def?: Omit<LexXrpcProcedureBuilder, 'type'>): LexXrpcProcedureBuilder => {
	return { ...def, type: 'procedure' };
};

const buildProcedureSchema = (ctx: BuildContext, def: LexXrpcProcedureBuilder): LexXrpcProcedure => {
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

export interface LexXrpcSubscriptionBuilder extends Annotations {
	type: 'subscription';
	parameters?: LexXrpcParametersBuilder;
	message?: XrpcSubscriptionMessage;
	errors?: XrpcError[];
}

export const subscription = (def?: Omit<LexXrpcSubscriptionBuilder, 'type'>): LexXrpcSubscriptionBuilder => {
	return { ...def, type: 'subscription' };
};

const buildSubscriptionSchema = (ctx: BuildContext, def: LexXrpcSubscriptionBuilder): LexXrpcSubscription => {
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

export interface LexRecordBuilder extends Annotations {
	type: 'record';
	key?: 'tid' | 'nsid' | 'any' | `literal:${string}`;
	record: LexObjectBuilder;
}

export const record = (def: Omit<LexRecordBuilder, 'type'>): LexRecordBuilder => {
	return { ...def, type: 'record' };
};

const buildRecordSchema = (ctx: BuildContext, def: LexRecordBuilder): LexRecord => {
	return {
		description: def.description,
		key: def.key,
		record: buildObjectSchema(delve(ctx, 'record'), def.record),
		type: 'record',
	};
};

export type RepoAction = 'create' | 'update' | 'delete';

export interface LexRepoPermissionBuilder {
	type: 'repo-permission';
	collection: '*' | Nsid[];
	action?: RepoAction[];
}

export const repoPermission = (def: Omit<LexRepoPermissionBuilder, 'type'>): LexRepoPermissionBuilder => {
	const { collection } = def;

	if (Array.isArray(collection)) {
		if (collection.length === 0) {
			throw new Error(`repo-permission: collection can't be empty`);
		}
	}

	return { ...def, type: 'repo-permission' };
};

export interface LexRpcPermissionBuilder {
	type: 'rpc-permission';
	lxm: '*' | Nsid[];
	aud: '*' | AtprotoAudience;
}

export const rpcPermission = (def: Omit<LexRpcPermissionBuilder, 'type'>): LexRpcPermissionBuilder => {
	const { lxm, aud } = def;

	if (Array.isArray(lxm)) {
		if (lxm.length === 0) {
			throw new Error(`rpc-permission: lxm can't be empty`);
		}
	}

	if (aud === '*' && lxm === '*') {
		throw new Error(`rpc-permission: aud and lxm can't both be wildcards`);
	}

	return { ...def, type: 'rpc-permission' };
};

export type BlobAccept = `${string}/${string}`;

export interface LexBlobPermissionBuilder {
	type: 'blob-permission';
	accept: BlobAccept[];
}

export const blobPermission = (def: Omit<LexBlobPermissionBuilder, 'type'>): LexBlobPermissionBuilder => {
	const { accept } = def;

	if (accept.length === 0) {
		throw new Error(`blob-permission: accept can't be empty`);
	}

	return { ...def, type: 'blob-permission' };
};

export type AccountAction = 'read' | 'manage';
export type AccountAttribute = 'email' | 'repo' | 'status';

export interface LexAccountPermissionBuilder {
	type: 'account-permission';
	attr: AccountAttribute;
	action?: AccountAction;
}

export const accountPermission = (
	def: Omit<LexAccountPermissionBuilder, 'type'>,
): LexAccountPermissionBuilder => {
	return { ...def, type: 'account-permission' };
};

export type IdentityAttribute = 'handle' | '*';

export interface LexIdentityPermissionBuilder {
	type: 'identity-permission';
	attr: IdentityAttribute;
}

export const identityPermission = (
	def: Omit<LexIdentityPermissionBuilder, 'type'>,
): LexIdentityPermissionBuilder => {
	return { ...def, type: 'identity-permission' };
};

export type LexPermissionBuilder =
	| LexRepoPermissionBuilder
	| LexRpcPermissionBuilder
	| LexBlobPermissionBuilder
	| LexAccountPermissionBuilder
	| LexIdentityPermissionBuilder;

const buildPermissionSchema = (_ctx: BuildContext, def: LexPermissionBuilder): LexPermission => {
	switch (def.type) {
		case 'repo-permission': {
			const { collection, action } = def;

			return {
				action: action,
				collection: collection === '*' ? ['*'] : collection,
				resource: 'repo',
				type: 'permission',
			};
		}
		case 'rpc-permission': {
			const { lxm, aud } = def;

			return {
				aud: aud,
				lxm: lxm === '*' ? ['*'] : lxm,
				resource: 'rpc',
				type: 'permission',
			};
		}
		case 'blob-permission': {
			const { accept } = def;

			return {
				accept: accept,
				resource: 'blob',
				type: 'permission',
			};
		}
		case 'account-permission': {
			const { attr, action } = def;

			return {
				action: action,
				attr: attr,
				resource: 'account',
				type: 'permission',
			};
		}
		case 'identity-permission': {
			const { attr } = def;

			return {
				attr: attr,
				resource: 'identity',
				type: 'permission',
			};
		}
	}
};

export interface LexPermissionSetBuilder extends Annotations {
	type: 'permission-set';
	title?: string;
	'title:lang'?: LexLang;
	detail?: string;
	'detail:lang'?: LexLang;
	permissions: LexPermissionBuilder[];
}

export const permissionSet = (def: Omit<LexPermissionSetBuilder, 'type'>): LexPermissionSetBuilder => {
	const { permissions } = def;

	if (permissions.length === 0) {
		throw new Error(`permission-set: permissions array can't be empty`);
	}

	return { ...def, type: 'permission-set' };
};

const buildPermissionSetSchema = (ctx: BuildContext, def: LexPermissionSetBuilder): LexPermissionSet => {
	return {
		'detail:lang': def['detail:lang'],
		'title:lang': def['title:lang'],
		description: def.description,
		detail: def.detail,
		permissions: def.permissions.map((perm, index) => {
			return buildPermissionSchema(delve(ctx, `permissions/${index}`), perm);
		}),
		title: def.title,
		type: 'permission-set',
	};
};

export type FieldWrapper<T> = {
	type: 'field-wrapper';
	wrapped: T;
	required: boolean;
	nullable: boolean;
};

export type MaybeFieldWrapper<T> = T | FieldWrapper<T>;

type MainType =
	| LexXrpcQueryBuilder
	| LexXrpcProcedureBuilder
	| LexXrpcSubscriptionBuilder
	| LexRecordBuilder
	| LexPermissionSetBuilder;

type DefType =
	| LexObjectBuilder
	| LexArrayBuilder
	| LexTokenBuilder
	| LexIpldBuilder
	| LexBlobBuilder
	| LexPrimitiveBuilder;

export interface LexDocumentBuilder {
	id: string;
	revision?: number;
	description?: string;
	defs: Record<string, MainType | DefType>;
}

export const document = (doc: LexDocumentBuilder): LexDocumentBuilder => {
	for (const [defId, def] of Object.entries(doc.defs)) {
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

const buildDefSchema = (ctx: BuildContext, def: MainType | DefType): LexUserType => {
	switch (def.type) {
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

		case 'object': {
			return buildObjectSchema(ctx, def);
		}
		case 'array': {
			return buildArraySchema(ctx, def);
		}
		case 'token': {
			return buildTokenSchema(ctx, def);
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
		case 'boolean': {
			return buildBooleanSchema(ctx, def);
		}
		case 'integer': {
			return buildIntegerSchema(ctx, def);
		}
		case 'string': {
			return buildStringSchema(ctx, def);
		}
		case 'unknown': {
			return buildUnknownSchema(ctx, def);
		}
	}
};

export const build = (options: { documents: LexDocumentBuilder[] }): Record<string, LexiconDoc> => {
	const documents = options.documents;

	const toplevelDefs = collectToplevelDefs(documents);
	const result: Record<string, LexiconDoc> = {};

	for (const doc of documents) {
		const defs: Record<string, LexUserType> = {};

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
