import * as v from '@badrap/valita';

import { isWithinGraphemeBounds, isWithinUtf8Bounds } from './utils.js';

// tsc dislikes this schema with the amount of type expansion that happens here.
// the interface declaration allows tsc to just reference it instead of
// expanding on every type reference.

const _integer = v
	.number()
	.assert((input) => input >= 0 && Number.isSafeInteger(input), `expected non-negative integer`);

const integer = _integer as integer.$schema;
declare namespace integer {
	export {};

	type $schematype = typeof _integer;
	export interface $schema extends $schematype {}
}

const _lexBoolean = v.object({
	type: v.literal('boolean'),
	description: v.string().optional(),
	default: v.boolean().optional(),
	const: v.boolean().optional(),
});

export const lexBoolean = _lexBoolean as lexBoolean.$schema;
export interface LexBoolean extends v.Infer<typeof lexBoolean> {}
export declare namespace lexBoolean {
	export {};

	type $schematype = typeof _lexBoolean;
	export interface $schema extends $schematype {}
}

const _lexInteger = v
	.object({
		type: v.literal('integer'),
		description: v.string().optional(),
		default: integer.optional(),
		minimum: integer.optional(),
		maximum: integer.optional(),
		enum: v.array(integer).optional(),
		const: integer.optional(),
	})
	.chain((input) => {
		const {
			minimum = 0,
			maximum = Infinity,
			const: constValue,
			default: defaultValue,
			enum: enumValues,
		} = input;

		if (minimum > maximum) {
			return v.err({
				message: `minimum value can't be greater than maximum value`,
				path: ['minimum'],
			});
		}

		if (defaultValue !== undefined) {
			if (defaultValue < minimum) {
				return v.err({
					message: `default value can't be lower than minimum value`,
					path: ['default'],
				});
			}

			if (defaultValue > maximum) {
				return v.err({
					message: `default value can't be greater than maximum value`,
					path: ['default'],
				});
			}
		}

		if (constValue !== undefined) {
			if (constValue < minimum) {
				return v.err({
					message: `const value can't be lower than minimum value`,
					path: ['const'],
				});
			}

			if (constValue > maximum) {
				return v.err({
					message: `const value can't be greater than maximum value`,
					path: ['const'],
				});
			}
		}

		if (enumValues !== undefined) {
			for (let idx = 0, len = enumValues.length; idx < len; idx++) {
				const enumValue = enumValues[idx];

				if (enumValue < minimum) {
					return v.err({
						message: `enum value can't be lower than minimum value`,
						path: ['enum', idx],
					});
				}

				if (enumValue > maximum) {
					return v.err({
						message: `enum value can't be greater than maximum value`,
						path: ['enum', idx],
					});
				}
			}
		}

		return v.ok(input);
	});

export const lexInteger = _lexInteger as lexInteger.$schema;
export interface LexInteger extends v.Infer<typeof lexInteger> {}
export declare namespace lexInteger {
	export {};

	type $schematype = typeof _lexInteger;
	export interface $schema extends $schematype {}
}

const _lexStringFormat = v.union(
	v.literal('datetime'),
	v.literal('uri'),
	v.literal('at-uri'),
	v.literal('did'),
	v.literal('handle'),
	v.literal('at-identifier'),
	v.literal('nsid'),
	v.literal('cid'),
	v.literal('language'),
	v.literal('tid'),
	v.literal('record-key'),
);

export const lexStringFormat = _lexStringFormat as lexStringFormat.$schema;
export type LexStringFormat = v.Infer<typeof lexStringFormat>;
export declare namespace lexStringFormat {
	export {};

	type $schematype = typeof _lexStringFormat;
	export interface $schema extends $schematype {}
}

const _lexString = v
	.object({
		type: v.literal('string'),
		format: lexStringFormat.optional(),
		description: v.string().optional(),
		default: v.string().optional(),
		minLength: integer.optional(),
		maxLength: integer.optional(),
		minGraphemes: integer.optional(),
		maxGraphemes: integer.optional(),
		enum: v.array(v.string()).optional(),
		const: v.string().optional(),
		knownValues: v.array(v.string()).optional(),
	})
	.chain((input) => {
		const {
			minLength = 0,
			maxLength = Infinity,
			minGraphemes = 0,
			maxGraphemes = Infinity,
			const: constValue,
			default: defaultValue,
			enum: enumValues,
			knownValues,
		} = input;

		if (minLength > maxLength) {
			return v.err({
				message: `minimum string length can't be greater than maximum string length`,
				path: ['minLength'],
			});
		}

		if (minGraphemes > maxGraphemes) {
			return v.err({
				message: `minimum grapheme count can't be greater than maximum grapheme count`,
				path: ['minGraphemes'],
			});
		}

		if (defaultValue !== undefined) {
			{
				const bound = isWithinUtf8Bounds(defaultValue, minLength, maxLength);

				if (bound === 'min') {
					return v.err({
						message: `default value can't be shorter than minimum string length`,
						path: ['default'],
					});
				}

				if (bound === 'max') {
					return v.err({
						message: `default value can't be longer than maximum string length`,
						path: ['default'],
					});
				}
			}

			{
				const bound = isWithinGraphemeBounds(defaultValue, minLength, maxLength);

				if (bound === 'min') {
					return v.err({
						message: `default value can't be shorter than minimum grapheme count`,
						path: ['default'],
					});
				}

				if (bound === 'max') {
					return v.err({
						message: `default value can't be longer than minimum grapheme count`,
						path: ['default'],
					});
				}
			}
		}

		if (constValue !== undefined) {
			{
				const bound = isWithinUtf8Bounds(constValue, minLength, maxLength);

				if (bound === 'min') {
					return v.err({
						message: `const value can't be shorter than minimum string length`,
						path: ['const'],
					});
				}

				if (bound === 'max') {
					return v.err({
						message: `const value can't be longer than maximum string length`,
						path: ['const'],
					});
				}
			}

			{
				const bound = isWithinGraphemeBounds(constValue, minLength, maxLength);

				if (bound === 'min') {
					return v.err({
						message: `const value can't be shorter than minimum grapheme count`,
						path: ['const'],
					});
				}

				if (bound === 'max') {
					return v.err({
						message: `const value can't be longer than minimum grapheme count`,
						path: ['const'],
					});
				}
			}
		}

		if (enumValues !== undefined) {
			for (let idx = 0, len = enumValues.length; idx < len; idx++) {
				const enumValue = enumValues[idx];

				{
					const bound = isWithinUtf8Bounds(enumValue, minLength, maxLength);

					if (bound === 'min') {
						return v.err({
							message: `enum value can't be shorter than minimum string length`,
							path: ['enum', idx],
						});
					}

					if (bound === 'max') {
						return v.err({
							message: `enum value can't be longer than maximum string length`,
							path: ['enum', idx],
						});
					}
				}

				{
					const bound = isWithinGraphemeBounds(enumValue, minGraphemes, maxGraphemes);

					if (bound === 'min') {
						return v.err({
							message: `enum value can't have fewer graphemes than minimum grapheme count`,
							path: ['enum', idx],
						});
					}

					if (bound === 'max') {
						return v.err({
							message: `enum value can't have more graphemes than maximum grapheme count`,
							path: ['enum', idx],
						});
					}
				}
			}
		}

		if (knownValues !== undefined) {
			for (let idx = 0, len = knownValues.length; idx < len; idx++) {
				const knownValue = knownValues[idx];

				{
					const bound = isWithinUtf8Bounds(knownValue, minLength, maxLength);

					if (bound === 'min') {
						return v.err({
							message: `known value can't be shorter than minimum string length`,
							path: ['known', idx],
						});
					}

					if (bound === 'max') {
						return v.err({
							message: `known value can't be longer than maximum string length`,
							path: ['known', idx],
						});
					}
				}

				{
					const bound = isWithinGraphemeBounds(knownValue, minGraphemes, maxGraphemes);

					if (bound === 'min') {
						return v.err({
							message: `known value can't have fewer graphemes than minimum grapheme count`,
							path: ['known', idx],
						});
					}

					if (bound === 'max') {
						return v.err({
							message: `known value can't have more graphemes than maximum grapheme count`,
							path: ['known', idx],
						});
					}
				}
			}
		}

		return v.ok(input);
	});

export const lexString = _lexString as lexString.$schema;
export interface LexString extends v.Infer<typeof lexString> {}
export declare namespace lexString {
	export {};

	type $schematype = typeof _lexString;
	export interface $schema extends $schematype {}
}

const _lexUnknown = v.object({
	type: v.literal('unknown'),
	description: v.string().optional(),
});

export const lexUnknown = _lexUnknown as lexUnknown.$schema;
export interface LexUnknown extends v.Infer<typeof lexUnknown> {}
export declare namespace lexUnknown {
	export {};

	type $schematype = typeof _lexUnknown;
	export interface $schema extends $schematype {}
}

const _lexPrimitive = v.union(lexBoolean, lexInteger, lexString, lexUnknown);

export const lexPrimitive = _lexPrimitive as lexPrimitive.$schema;
export type LexPrimitive = v.Infer<typeof lexPrimitive>;
export declare namespace lexPrimitive {
	export {};

	type $schematype = typeof _lexPrimitive;
	export interface $schema extends $schematype {}
}

const _lexBytes = v
	.object({
		type: v.literal('bytes'),
		description: v.string().optional(),
		minLength: integer.optional(),
		maxLength: integer.optional(),
	})
	.chain((input) => {
		const { minLength = 0, maxLength = Infinity } = input;

		if (minLength > maxLength) {
			return v.err({
				message: `minimum byte length can't be greater than maximum byte length`,
				path: ['minLength'],
			});
		}

		return v.ok(input);
	});

export const lexBytes = _lexBytes as lexBytes.$schema;
export interface LexBytes extends v.Infer<typeof lexBytes> {}
export declare namespace lexBytes {
	export {};

	type $schematype = typeof _lexBytes;
	export interface $schema extends $schematype {}
}

const _lexCidLink = v.object({
	type: v.literal('cid-link'),
	description: v.string().optional(),
});

export const lexCidLink = _lexCidLink as lexCidLink.$schema;
export interface LexCidLink extends v.Infer<typeof lexCidLink> {}
export declare namespace lexCidLink {
	export {};

	type $schematype = typeof _lexCidLink;
	export interface $schema extends $schematype {}
}

const _lexIpldType = v.union(lexBytes, lexCidLink);

export const lexIpldType = _lexIpldType as lexIpldType.$schema;
export type LexIpldType = v.Infer<typeof lexIpldType>;
export declare namespace lexIpldType {
	export {};

	type $schematype = typeof _lexIpldType;
	export interface $schema extends $schematype {}
}

const REF_RE =
	/^(?=.)(?:[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\.[a-zA-Z][a-zA-Z0-9]{0,62}?)?(?:#[a-zA-Z][a-zA-Z0-9_]{0,62}?)?$/;

const refString = v.string().assert((input) => REF_RE.test(input));

const _lexRef = v.object({
	type: v.literal('ref'),
	description: v.string().optional(),
	ref: refString,
});

export const lexRef = _lexRef as lexRef.$schema;
export interface LexRef extends v.Infer<typeof lexRef> {}
export declare namespace lexRef {
	export {};

	type $schematype = typeof _lexRef;
	export interface $schema extends $schematype {}
}

const _lexRefUnion = v.object({
	type: v.literal('union'),
	description: v.string().optional(),
	refs: v.array(refString),
	closed: v.boolean().optional(() => false),
});

export const lexRefUnion = _lexRefUnion as lexRefUnion.$schema;
export interface LexRefUnion extends v.Infer<typeof lexRefUnion> {}
export declare namespace lexRefUnion {
	export {};

	type $schematype = typeof _lexRefUnion;
	export interface $schema extends $schematype {}
}

const _lexRefVariant = v.union(lexRef, lexRefUnion);

export const lexRefVariant = _lexRefVariant as lexRefVariant.$schema;
export type LexRefVariant = v.Infer<typeof lexRefVariant>;
export declare namespace lexRefVariant {
	export {};

	type $schematype = typeof _lexRefVariant;
	export interface $schema extends $schematype {}
}

const _lexBlob = v.object({
	type: v.literal('blob'),
	description: v.string().optional(),
	accept: v.array(v.string()).optional(),
	maxSize: integer.optional(),
});

export const lexBlob = _lexBlob as lexBlob.$schema;
export interface LexBlob extends v.Infer<typeof lexBlob> {}
export declare namespace lexBlob {
	export {};

	type $schematype = typeof _lexBlob;
	export interface $schema extends $schematype {}
}

const _lexArray = v
	.object({
		type: v.literal('array'),
		description: v.string().optional(),
		items: v.union(lexPrimitive, lexIpldType, lexRefVariant, lexBlob),
		minLength: integer.optional(),
		maxLength: integer.optional(),
	})
	.chain((input) => {
		const { minLength = 0, maxLength = Infinity } = input;

		if (minLength > maxLength) {
			return v.err({
				message: `minimum array length can't be greater than maximum array length`,
				path: ['minLength'],
			});
		}

		return v.ok(input);
	});

export const lexArray = _lexArray as lexArray.$schema;
export interface LexArray extends v.Infer<typeof lexArray> {}
export declare namespace lexArray {
	export {};

	type $schematype = typeof _lexArray;
	export interface $schema extends $schematype {}
}

const _lexPrimitiveArray = v
	.object({
		type: v.literal('array'),
		description: v.string().optional(),
		items: lexPrimitive,
		minLength: integer.optional(),
		maxLength: integer.optional(),
	})
	.chain((input) => {
		const { minLength = 0, maxLength = Infinity } = input;

		if (minLength > maxLength) {
			return v.err({
				message: `minimum array length can't be greater than maximum array length`,
				path: ['minLength'],
			});
		}

		return v.ok(input);
	});

export const lexPrimitiveArray = _lexPrimitiveArray as lexPrimitiveArray.$schema;
export interface LexPrimitiveArray extends v.Infer<typeof lexPrimitiveArray> {}
export declare namespace lexPrimitiveArray {
	export {};

	type $schematype = typeof _lexPrimitiveArray;
	export interface $schema extends $schematype {}
}

const _lexToken = v.object({
	type: v.literal('token'),
	description: v.string().optional(),
});

export const lexToken = _lexToken as lexToken.$schema;
export interface LexToken extends v.Infer<typeof lexToken> {}
export declare namespace lexToken {
	export {};

	type $schematype = typeof _lexToken;
	export interface $schema extends $schematype {}
}

const KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,62}?$/;

const refineObjectProperties = <T extends { required?: string[]; properties?: Record<string, unknown> }>(
	input: T,
): v.ValitaResult<T> => {
	const { required = [], properties } = input;

	for (const key in properties) {
		if (!KEY_RE.test(key)) {
			return v.err({
				message: `invalid property key`,
				path: ['properties', key],
			});
		}
	}

	if (required.length > 0) {
		if (properties === undefined) {
			return v.err({
				message: `required fields specified but no properties defined`,
				path: ['properties'],
			});
		}

		for (const key of required) {
			if (properties[key] === undefined) {
				return v.err({
					message: `required fields not defined`,
					path: ['properties', key],
				});
			}
		}
	}

	return v.ok(input);
};

const _lexObject = v
	.object({
		type: v.literal('object'),
		description: v.string().optional(),
		required: v.array(v.string()).optional(),
		nullable: v.array(v.string()).optional(),
		properties: v.record(v.union(lexArray, lexPrimitive, lexIpldType, lexRefVariant, lexBlob)).optional(),
	})
	.chain(refineObjectProperties);

export const lexObject = _lexObject as lexObject.$schema;
export interface LexObject extends v.Infer<typeof lexObject> {}
export declare namespace lexObject {
	export {};

	type $schematype = typeof _lexObject;
	export interface $schema extends $schematype {}
}

const _lexXrpcParameters = v
	.object({
		type: v.literal('params'),
		description: v.string().optional(),
		required: v.array(v.string()).optional(),
		properties: v.record(v.union(lexPrimitive, lexPrimitiveArray)).optional(),
	})
	.chain(refineObjectProperties);

export const lexXrpcParameters = _lexXrpcParameters as lexXrpcParameters.$schema;
export interface LexXrpcParameters extends v.Infer<typeof lexXrpcParameters> {}
export declare namespace lexXrpcParameters {
	export {};

	type $schematype = typeof _lexXrpcParameters;
	export interface $schema extends $schematype {}
}

const MIME_TYPE_RE =
	/^\s*(?:\*\/\*|[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*(?:\s*,\s*[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*)*?)\s*$/;

const _lexXrpcBody = v.object({
	description: v.string().optional(),
	encoding: v
		.string()
		.assert((input) => MIME_TYPE_RE.test(input), `must be a comma-delimited list of mime types`),
	schema: v.union(lexRefVariant, lexObject).optional(),
});

export const lexXrpcBody = _lexXrpcBody as lexXrpcBody.$schema;
export interface LexXrpcBody extends v.Infer<typeof lexXrpcBody> {}
export declare namespace lexXrpcBody {
	export {};

	type $schematype = typeof _lexXrpcBody;
	export interface $schema extends $schematype {}
}

const _lexXrpcSubscriptionMessage = v.object({
	description: v.string().optional(),
	schema: v.union(lexRefVariant, lexObject).optional(),
});

export const lexXrpcSubscriptionMessage = _lexXrpcSubscriptionMessage as lexXrpcSubscriptionMessage.$schema;
export interface LexXrpcSubscriptionMessage extends v.Infer<typeof lexXrpcSubscriptionMessage> {}
export declare namespace lexXrpcSubscriptionMessage {
	export {};

	type $schematype = typeof _lexXrpcSubscriptionMessage;
	export interface $schema extends $schematype {}
}

const _lexXrpcError = v.object({
	name: v.string(),
	description: v.string().optional(),
});

export const lexXrpcError = _lexXrpcError as lexXrpcError.$schema;
export interface LexXrpcError extends v.Infer<typeof lexXrpcError> {}
export declare namespace lexXrpcError {
	export {};

	type $schematype = typeof _lexXrpcError;
	export interface $schema extends $schematype {}
}

const _lexXrpcQuery = v.object({
	type: v.literal('query'),
	description: v.string().optional(),
	parameters: lexXrpcParameters.optional(),
	output: lexXrpcBody.optional(),
	errors: v.array(lexXrpcError).optional(),
});

export const lexXrpcQuery = _lexXrpcQuery as lexXrpcQuery.$schema;
export interface LexXrpcQuery extends v.Infer<typeof lexXrpcQuery> {}
export declare namespace lexXrpcQuery {
	export {};

	type $schematype = typeof _lexXrpcQuery;
	export interface $schema extends $schematype {}
}

const _lexXrpcProcedure = v.object({
	type: v.literal('procedure'),
	description: v.string().optional(),
	parameters: lexXrpcParameters.optional(),
	input: lexXrpcBody.optional(),
	output: lexXrpcBody.optional(),
	errors: v.array(lexXrpcError).optional(),
});

export const lexXrpcProcedure = _lexXrpcProcedure as lexXrpcProcedure.$schema;
export interface LexXrpcProcedure extends v.Infer<typeof lexXrpcProcedure> {}
export declare namespace lexXrpcProcedure {
	export {};

	type $schematype = typeof _lexXrpcProcedure;
	export interface $schema extends $schematype {}
}

const _lexXrpcSubscription = v.object({
	type: v.literal('subscription'),
	description: v.string().optional(),
	parameters: lexXrpcParameters.optional(),
	message: lexXrpcSubscriptionMessage.optional(),
	errors: v.array(lexXrpcError).optional(),
});

export const lexXrpcSubscription = _lexXrpcSubscription as lexXrpcSubscription.$schema;
export interface LexXrpcSubscription extends v.Infer<typeof lexXrpcSubscription> {}
export declare namespace lexXrpcSubscription {
	export {};

	type $schematype = typeof _lexXrpcSubscription;
	export interface $schema extends $schematype {}
}

const LITERAL_KEY_RE = /^literal:(.+)$/;

const _lexRecord = v.object({
	type: v.literal('record'),
	description: v.string().optional(),
	key: v
		.union(
			v.literal('tid'),
			v.literal('nsid'),
			v.literal('any'),
			v.string().assert<`literal:${string}`>((input) => LITERAL_KEY_RE.test(input)),
		)
		.optional(() => 'any'),
	record: lexObject,
});

export const lexRecord = _lexRecord as lexRecord.$schema;
export interface LexRecord extends v.Infer<typeof lexRecord> {}
export declare namespace lexRecord {
	export {};

	type $schematype = typeof _lexRecord;
	export interface $schema extends $schematype {}
}

const _lexUserType = v.union(
	lexRecord,
	lexXrpcQuery,
	lexXrpcProcedure,
	lexXrpcSubscription,
	lexObject,
	lexArray,
	lexToken,
	lexIpldType,
	lexBlob,
	lexPrimitive,
);

export const lexUserType = _lexUserType as lexUserType.$schema;
export type LexUserType = v.Infer<typeof lexUserType>;
export declare namespace lexUserType {
	export {};

	type $schematype = typeof _lexUserType;
	export interface $schema extends $schematype {}
}

const NSID_RE =
	/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/;

const _lexiconDoc = v
	.object({
		lexicon: v.literal(1),
		id: v.string().assert((input) => NSID_RE.test(input), `must be valid nsid`),
		revision: integer.optional(),
		description: v.string().optional(),
		// defs: v.record(v.pipe(v.string(), v.regex(/^[a-zA-Z][a-zA-Z0-9_]{0,62}?$/)), lexUserType),
		defs: v.record(lexUserType),
	})
	.chain((input) => {
		const { defs } = input;

		for (const key in defs) {
			const def = defs[key];

			if (
				key !== 'main' &&
				(def.type === 'record' ||
					def.type === 'procedure' ||
					def.type === 'query' ||
					def.type === 'subscription')
			) {
				return v.err({
					message: `records, procedures, queries and subscriptions must be the main definition`,
					path: ['defs', key],
				});
			}
		}

		return v.ok(input);
	});

export const lexiconDoc = _lexiconDoc as lexiconDoc.$schema;
export interface LexiconDoc extends v.Infer<typeof lexiconDoc> {}
export declare namespace lexiconDoc {
	export {};

	type $schematype = typeof _lexiconDoc;
	export interface $schema extends $schematype {}
}
