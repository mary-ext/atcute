import * as v from '@badrap/valita';

import { isWithinGraphemeBounds, isWithinUtf8Bounds } from './internal/utils.js';
import * as t from './types.js';

const integer = v
	.number()
	.assert((input) => input >= 0 && Number.isSafeInteger(input), `expected non-negative integer`);

export const lexBoolean: v.Type<t.LexBoolean> = v
	.object({
		type: v.literal('boolean'),
		description: v.string().optional(),
		default: v.boolean().optional(),
		const: v.boolean().optional(),
	})
	.chain((input) => {
		const { const: constValue, default: defaultValue } = input;

		if (defaultValue !== undefined) {
			if (constValue !== undefined && defaultValue !== constValue) {
				return v.err({
					message: `default value must match constant value`,
					path: ['default'],
				});
			}
		}

		return v.ok(input);
	});

export const lexInteger: v.Type<t.LexInteger> = v
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
			if (constValue !== undefined && defaultValue !== constValue) {
				return v.err({
					message: `default value must match constant value`,
					path: ['default'],
				});
			}

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
			if (enumValues !== undefined) {
				return v.err({
					message: `const and enum can't be used together`,
					path: ['const'],
				});
			}

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

export const lexStringFormat: v.Type<t.LexStringFormat> = v.union(
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

export const lexString: v.Type<t.LexString> = v
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
			if (constValue !== undefined && defaultValue !== constValue) {
				return v.err({
					message: `default value must match constant value`,
					path: ['default'],
				});
			}

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
			if (enumValues !== undefined) {
				return v.err({
					message: `const and enum can't be used together`,
					path: ['const'],
				});
			}

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

export const lexUnknown: v.Type<t.LexUnknown> = v.object({
	type: v.literal('unknown'),
	description: v.string().optional(),
});

export const lexPrimitive: v.Type<t.LexPrimitive> = v.union(lexBoolean, lexInteger, lexString, lexUnknown);

export const lexBytes: v.Type<t.LexBytes> = v
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

export const lexCidLink: v.Type<t.LexCidLink> = v.object({
	type: v.literal('cid-link'),
	description: v.string().optional(),
});

export const lexIpldType: v.Type<t.LexIpldType> = v.union(lexBytes, lexCidLink);

const REF_RE =
	/^(?=.)(?:[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\.[a-zA-Z][a-zA-Z0-9]{0,62}?)?(?:#[a-zA-Z][a-zA-Z0-9_]{0,62}?)?$/;

const refString = v.string().assert((input) => REF_RE.test(input), `invalid ref identifier`);

export const lexRef: v.Type<t.LexRef> = v.object({
	type: v.literal('ref'),
	description: v.string().optional(),
	ref: refString,
});

export const lexRefUnion: v.Type<t.LexRefUnion> = v
	.object({
		type: v.literal('union'),
		description: v.string().optional(),
		refs: v.array(refString),
		closed: v.boolean().optional(),
	})
	.chain((input) => {
		const { refs, closed = false } = input;

		if (closed) {
			if (refs.length === 0) {
				return v.err({
					message: `closed enum can't have zero ref members`,
					path: ['refs'],
				});
			}
		}

		return v.ok(input);
	});

export const lexRefVariant: v.Type<t.LexRefVariant> = v.union(lexRef, lexRefUnion);

export const lexBlob: v.Type<t.LexBlob> = v.object({
	type: v.literal('blob'),
	description: v.string().optional(),
	accept: v.array(v.string()).optional(),
	maxSize: integer.optional(),
});

export const lexArray: v.Type<t.LexArray> = v
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

export const lexPrimitiveArray: v.Type<t.LexPrimitiveArray> = v
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

export const lexToken: v.Type<t.LexToken> = v.object({
	type: v.literal('token'),
	description: v.string().optional(),
});

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

export const lexObject: v.Type<t.LexObject> = v
	.object({
		type: v.literal('object'),
		description: v.string().optional(),
		required: v.array(v.string()).optional(),
		nullable: v.array(v.string()).optional(),
		properties: v.record(v.union(lexArray, lexPrimitive, lexIpldType, lexRefVariant, lexBlob)).optional(),
	})
	.chain(refineObjectProperties);

export const lexXrpcParameters: v.Type<t.LexXrpcParameters> = v
	.object({
		type: v.literal('params'),
		description: v.string().optional(),
		required: v.array(v.string()).optional(),
		properties: v.record(v.union(lexPrimitive, lexPrimitiveArray)).optional(),
	})
	.chain(refineObjectProperties);

const MIME_TYPE_RE =
	/^\s*(?:\*\/\*|[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*(?:\s*,\s*[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*)*?)\s*$/;

export const lexXrpcBody: v.Type<t.LexXrpcBody> = v.object({
	description: v.string().optional(),
	encoding: v
		.string()
		.assert((input) => MIME_TYPE_RE.test(input), `must be a comma-delimited list of mime types`),
	schema: v.union(lexRefVariant, lexObject).optional(),
});

export const lexXrpcSubscriptionMessage: v.Type<t.LexXrpcSubscriptionMessage> = v.object({
	description: v.string().optional(),
	schema: v.union(lexRefVariant, lexObject).optional(),
});

export const lexXrpcError: v.Type<t.LexXrpcError> = v.object({
	name: v.string(),
	description: v.string().optional(),
});

export const lexXrpcQuery: v.Type<t.LexXrpcQuery> = v.object({
	type: v.literal('query'),
	description: v.string().optional(),
	parameters: lexXrpcParameters.optional(),
	output: lexXrpcBody.optional(),
	errors: v.array(lexXrpcError).optional(),
});

export const lexXrpcProcedure: v.Type<t.LexXrpcProcedure> = v.object({
	type: v.literal('procedure'),
	description: v.string().optional(),
	parameters: lexXrpcParameters.optional(),
	input: lexXrpcBody.optional(),
	output: lexXrpcBody.optional(),
	errors: v.array(lexXrpcError).optional(),
});

export const lexXrpcSubscription: v.Type<t.LexXrpcSubscription> = v.object({
	type: v.literal('subscription'),
	description: v.string().optional(),
	parameters: lexXrpcParameters.optional(),
	message: lexXrpcSubscriptionMessage.optional(),
	errors: v.array(lexXrpcError).optional(),
});

export const lexRecord: v.Type<t.LexRecord> = v.object({
	type: v.literal('record'),
	description: v.string().optional(),
	key: v
		.union(
			v.literal('tid'),
			v.literal('nsid'),
			v.literal('any'),
			v.string().assert<`literal:${string}`>((input) => input.startsWith('literal:'), {
				message: `invalid literal key`,
			}),
		)
		.optional(),
	record: lexObject,
});

export const lexUserType: v.Type<t.LexUserType> = v.union(
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

const NSID_RE =
	/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/;

export const lexiconDoc: v.Type<t.LexiconDoc> = v.object({
	lexicon: v.literal(1),
	id: v.string().assert((input) => NSID_RE.test(input), `must be valid nsid`),
	revision: integer.optional(),
	description: v.string().optional(),
	defs: v.record(lexUserType).chain((defs) => {
		for (const key in defs) {
			const def = defs[key];

			if (!KEY_RE.test(key)) {
				return v.err({
					message: `invalid definition id`,
					path: [key],
				});
			}

			if (
				key !== 'main' &&
				(def.type === 'record' ||
					def.type === 'procedure' ||
					def.type === 'query' ||
					def.type === 'subscription')
			) {
				return v.err({
					message: `records, procedures, queries and subscriptions must be the main definition`,
					path: [key],
				});
			}
		}

		return v.ok(defs);
	}),
});
