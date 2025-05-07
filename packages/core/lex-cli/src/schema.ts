import * as v from 'valibot';

// tsc dislikes this schema with the amount of type expansion that happens here.
// the interface declaration allows tsc to just reference it instead of
// expanding on every type reference.

const _integer = v.pipe(v.number(), v.safeInteger(), v.minValue(0));

const integer = _integer as integer.$schema;
declare namespace integer {
	export {};

	type $schematype = typeof _integer;
	export interface $schema extends $schematype {}
}

const _lexBoolean = v.strictObject({
	type: v.literal('boolean'),
	description: v.optional(v.string()),
	default: v.optional(v.boolean()),
	const: v.optional(v.boolean()),
});

export const lexBoolean = _lexBoolean as lexBoolean.$schema;
export interface LexBoolean extends v.InferInput<typeof lexBoolean> {}
export declare namespace lexBoolean {
	export {};

	type $schematype = typeof _lexBoolean;
	export interface $schema extends $schematype {}
}

const _lexInteger = v.strictObject({
	type: v.literal('integer'),
	description: v.optional(v.string()),
	default: v.optional(integer),
	minimum: v.optional(integer),
	maximum: v.optional(integer),
	enum: v.optional(v.array(integer)),
	const: v.optional(integer),
});

export const lexInteger = _lexInteger as lexInteger.$schema;
export interface LexInteger extends v.InferInput<typeof lexInteger> {}
export declare namespace lexInteger {
	export {};

	type $schematype = typeof _lexInteger;
	export interface $schema extends $schematype {}
}

const _lexStringFormat = v.picklist([
	'datetime',
	'uri',
	'at-uri',
	'did',
	'handle',
	'at-identifier',
	'nsid',
	'cid',
	'language',
	'tid',
	'record-key',
]);

export const lexStringFormat = _lexStringFormat as lexStringFormat.$schema;
export type LexStringFormat = v.InferInput<typeof lexStringFormat>;
export declare namespace lexStringFormat {
	export {};

	type $schematype = typeof _lexStringFormat;
	export interface $schema extends $schematype {}
}

const _lexString = v.strictObject({
	type: v.literal('string'),
	format: v.optional(lexStringFormat),
	description: v.optional(v.string()),
	default: v.optional(v.string()),
	minLength: v.optional(integer),
	maxLength: v.optional(integer),
	minGraphemes: v.optional(integer),
	maxGraphemes: v.optional(integer),
	enum: v.optional(v.array(v.string())),
	const: v.optional(v.string()),
	knownValues: v.optional(v.array(v.string())),
});

export const lexString = _lexString as lexString.$schema;
export interface LexString extends v.InferInput<typeof lexString> {}
export declare namespace lexString {
	export {};

	type $schematype = typeof _lexString;
	export interface $schema extends $schematype {}
}

const _lexUnknown = v.strictObject({
	type: v.literal('unknown'),
	description: v.optional(v.string()),
});

export const lexUnknown = _lexUnknown as lexUnknown.$schema;
export interface LexUnknown extends v.InferInput<typeof lexUnknown> {}
export declare namespace lexUnknown {
	export {};

	type $schematype = typeof _lexUnknown;
	export interface $schema extends $schematype {}
}

const _lexPrimitive = v.variant('type', [lexBoolean, lexInteger, lexString, lexUnknown]);

export const lexPrimitive = _lexPrimitive as lexPrimitive.$schema;
export type LexPrimitive = v.InferInput<typeof lexPrimitive>;
export declare namespace lexPrimitive {
	export {};

	type $schematype = typeof _lexPrimitive;
	export interface $schema extends $schematype {}
}

const _lexBytes = v.strictObject({
	type: v.literal('bytes'),
	description: v.optional(v.string()),
	minLength: v.optional(integer),
	maxLength: v.optional(integer),
});

export const lexBytes = _lexBytes as lexBytes.$schema;
export interface LexBytes extends v.InferInput<typeof lexBytes> {}
export declare namespace lexBytes {
	export {};

	type $schematype = typeof _lexBytes;
	export interface $schema extends $schematype {}
}

const _lexCidLink = v.strictObject({
	type: v.literal('cid-link'),
	description: v.optional(v.string()),
});

export const lexCidLink = _lexCidLink as lexCidLink.$schema;
export interface LexCidLink extends v.InferInput<typeof lexCidLink> {}
export declare namespace lexCidLink {
	export {};

	type $schematype = typeof _lexCidLink;
	export interface $schema extends $schematype {}
}

const _lexIpldType = v.variant('type', [lexBytes, lexCidLink]);

export const lexIpldType = _lexIpldType as lexIpldType.$schema;
export type LexIpldType = v.InferInput<typeof lexIpldType>;
export declare namespace lexIpldType {
	export {};

	type $schematype = typeof _lexIpldType;
	export interface $schema extends $schematype {}
}

const refString = v.pipe(
	v.string(),
	v.regex(
		/^(?=.)(?:[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\.[a-zA-Z][a-zA-Z0-9]{0,62}?)?(?:#[a-zA-Z][a-zA-Z0-9_]{0,62}?)?$/,
	),
);

const _lexRef = v.strictObject({
	type: v.literal('ref'),
	description: v.optional(v.string()),
	ref: refString,
});

export const lexRef = _lexRef as lexRef.$schema;
export interface LexRef extends v.InferInput<typeof lexRef> {}
export declare namespace lexRef {
	export {};

	type $schematype = typeof _lexRef;
	export interface $schema extends $schematype {}
}

const _lexRefUnion = v.strictObject({
	type: v.literal('union'),
	description: v.optional(v.string()),
	refs: v.array(refString),
	closed: v.optional(v.boolean(), false),
});

export const lexRefUnion = _lexRefUnion as lexRefUnion.$schema;
export interface LexRefUnion extends v.InferInput<typeof lexRefUnion> {}
export declare namespace lexRefUnion {
	export {};

	type $schematype = typeof _lexRefUnion;
	export interface $schema extends $schematype {}
}

const _lexRefVariant = v.variant('type', [lexRef, lexRefUnion]);

export const lexRefVariant = _lexRefVariant as lexRefVariant.$schema;
export type LexRefVariant = v.InferInput<typeof lexRefVariant>;
export declare namespace lexRefVariant {
	export {};

	type $schematype = typeof _lexRefVariant;
	export interface $schema extends $schematype {}
}

const _lexBlob = v.strictObject({
	type: v.literal('blob'),
	description: v.optional(v.string()),
	accept: v.optional(v.array(v.string())),
	maxSize: v.optional(integer),
});

export const lexBlob = _lexBlob as lexBlob.$schema;
export interface LexBlob extends v.InferInput<typeof lexBlob> {}
export declare namespace lexBlob {
	export {};

	type $schematype = typeof _lexBlob;
	export interface $schema extends $schematype {}
}

const _lexArray = v.strictObject({
	type: v.literal('array'),
	description: v.optional(v.string()),
	items: v.variant('type', [lexPrimitive, lexIpldType, lexRefVariant, lexBlob]),
	minLength: v.optional(integer),
	maxLength: v.optional(integer),
});

export const lexArray = _lexArray as lexArray.$schema;
export interface LexArray extends v.InferInput<typeof lexArray> {}
export declare namespace lexArray {
	export {};

	type $schematype = typeof _lexArray;
	export interface $schema extends $schematype {}
}

const _lexPrimitiveArray = v.strictObject({
	...lexArray.entries,
	items: lexPrimitive,
});

export const lexPrimitiveArray = _lexPrimitiveArray as lexPrimitiveArray.$schema;
export interface LexPrimitiveArray extends v.InferInput<typeof lexPrimitiveArray> {}
export declare namespace lexPrimitiveArray {
	export {};

	type $schematype = typeof _lexPrimitiveArray;
	export interface $schema extends $schematype {}
}

const _lexToken = v.strictObject({
	type: v.literal('token'),
	description: v.optional(v.string()),
});

export const lexToken = _lexToken as lexToken.$schema;
export interface LexToken extends v.InferInput<typeof lexToken> {}
export declare namespace lexToken {
	export {};

	type $schematype = typeof _lexToken;
	export interface $schema extends $schematype {}
}

const _lexObject = v.strictObject({
	type: v.literal('object'),
	description: v.optional(v.string()),
	required: v.optional(v.array(v.string())),
	nullable: v.optional(v.array(v.string())),
	properties: v.optional(
		v.record(
			v.pipe(v.string(), v.regex(/^[a-zA-Z][a-zA-Z0-9_]{0,62}?$/)),
			v.variant('type', [lexArray, lexPrimitive, lexIpldType, lexRefVariant, lexBlob]),
		),
	),
});

export const lexObject = v.pipe(
	_lexObject,
	v.rawCheck(({ dataset, addIssue }) => {
		if (!dataset.typed) {
			return;
		}

		const { required = [], properties } = dataset.value;

		if (required.length === 0) {
			return;
		}

		if (properties === undefined) {
			addIssue({
				message: 'required fields specified but no properties defined',
				path: [
					{
						type: 'object',
						origin: 'value',
						input: dataset.value,
						key: 'properties',
						value: undefined,
					},
				],
			});

			return;
		}

		for (const field of required) {
			if (properties[field] === undefined) {
				addIssue({
					message: `required field not defined`,
					path: [
						{
							type: 'object',
							origin: 'value',
							input: dataset.value,
							key: 'properties',
							value: properties,
						},
						{
							type: 'object',
							origin: 'value',
							input: properties,
							key: field,
							value: undefined,
						},
					],
				});
			}
		}
	}),
) as lexObject.$schema;
export interface LexObject extends v.InferInput<typeof lexObject> {}
export declare namespace lexObject {
	export {};

	type $schematype = typeof _lexObject;
	export interface $schema extends $schematype {}
}

const _lexXrpcParameters = v.strictObject({
	type: v.literal('params'),
	description: v.optional(v.string()),
	required: v.optional(v.array(v.string())),
	properties: v.optional(
		v.record(
			v.pipe(v.string(), v.regex(/^[a-zA-Z][a-zA-Z0-9]{0,62}?$/)),
			v.variant('type', [lexPrimitive, lexPrimitiveArray]),
		),
	),
});

export const lexXrpcParameters = v.pipe(
	_lexXrpcParameters,
	v.rawCheck(({ dataset, addIssue }) => {
		if (!dataset.typed) {
			return;
		}

		const { required = [], properties } = dataset.value;

		if (required.length === 0) {
			return;
		}

		if (properties === undefined) {
			addIssue({
				message: 'required fields specified but no properties defined',
				path: [
					{
						type: 'object',
						origin: 'value',
						input: dataset.value,
						key: 'properties',
						value: undefined,
					},
				],
			});

			return;
		}

		for (const field of required) {
			if (properties[field] === undefined) {
				addIssue({
					message: `required field not defined`,
					path: [
						{
							type: 'object',
							origin: 'value',
							input: dataset.value,
							key: 'properties',
							value: properties,
						},
						{
							type: 'object',
							origin: 'value',
							input: properties,
							key: field,
							value: undefined,
						},
					],
				});
			}
		}
	}),
) as lexXrpcParameters.$schema;
export interface LexXrpcParameters extends v.InferInput<typeof lexXrpcParameters> {}
export declare namespace lexXrpcParameters {
	export {};

	type $schematype = typeof _lexXrpcParameters;
	export interface $schema extends $schematype {}
}

const _lexXrpcBody = v.strictObject({
	description: v.optional(v.string()),
	encoding: v.string(),
	schema: v.optional(v.variant('type', [lexRefVariant, lexObject])),
});

export const lexXrpcBody = _lexXrpcBody as lexXrpcBody.$schema;
export interface LexXrpcBody extends v.InferInput<typeof lexXrpcBody> {}
export declare namespace lexXrpcBody {
	export {};

	type $schematype = typeof _lexXrpcBody;
	export interface $schema extends $schematype {}
}

const _lexXrpcSubscriptionMessage = v.strictObject({
	description: v.optional(v.string()),
	schema: v.optional(v.variant('type', [lexRefVariant, lexObject])),
});

export const lexXrpcSubscriptionMessage = _lexXrpcSubscriptionMessage as lexXrpcSubscriptionMessage.$schema;
export interface LexXrpcSubscriptionMessage extends v.InferInput<typeof lexXrpcSubscriptionMessage> {}
export declare namespace lexXrpcSubscriptionMessage {
	export {};

	type $schematype = typeof _lexXrpcSubscriptionMessage;
	export interface $schema extends $schematype {}
}

const _lexXrpcError = v.strictObject({
	name: v.string(),
	description: v.optional(v.string()),
});

export const lexXrpcError = _lexXrpcError as lexXrpcError.$schema;
export interface LexXrpcError extends v.InferInput<typeof lexXrpcError> {}
export declare namespace lexXrpcError {
	export {};

	type $schematype = typeof _lexXrpcError;
	export interface $schema extends $schematype {}
}

const _lexXrpcQuery = v.strictObject({
	type: v.literal('query'),
	description: v.optional(v.string()),
	parameters: v.optional(lexXrpcParameters),
	output: v.optional(lexXrpcBody),
	errors: v.optional(v.array(lexXrpcError)),
});

export const lexXrpcQuery = _lexXrpcQuery as lexXrpcQuery.$schema;
export interface LexXrpcQuery extends v.InferInput<typeof lexXrpcQuery> {}
export declare namespace lexXrpcQuery {
	export {};

	type $schematype = typeof _lexXrpcQuery;
	export interface $schema extends $schematype {}
}

const _lexXrpcProcedure = v.strictObject({
	type: v.literal('procedure'),
	description: v.optional(v.string()),
	parameters: v.optional(lexXrpcParameters),
	input: v.optional(lexXrpcBody),
	output: v.optional(lexXrpcBody),
	errors: v.optional(v.array(lexXrpcError)),
});

export const lexXrpcProcedure = _lexXrpcProcedure as lexXrpcProcedure.$schema;
export interface LexXrpcProcedure extends v.InferInput<typeof lexXrpcProcedure> {}
export declare namespace lexXrpcProcedure {
	export {};

	type $schematype = typeof _lexXrpcProcedure;
	export interface $schema extends $schematype {}
}

const _lexXrpcSubscription = v.strictObject({
	type: v.literal('subscription'),
	description: v.optional(v.string()),
	parameters: v.optional(lexXrpcParameters),
	message: v.optional(lexXrpcSubscriptionMessage),
	errors: v.optional(v.array(lexXrpcError)),
});

export const lexXrpcSubscription = _lexXrpcSubscription as lexXrpcSubscription.$schema;
export interface LexXrpcSubscription extends v.InferInput<typeof lexXrpcSubscription> {}
export declare namespace lexXrpcSubscription {
	export {};

	type $schematype = typeof _lexXrpcSubscription;
	export interface $schema extends $schematype {}
}

const _lexRecord = v.strictObject({
	type: v.literal('record'),
	description: v.optional(v.string()),
	key: v.optional(
		v.union([
			v.literal('tid'),
			v.literal('nsid'),
			v.literal('any'),
			v.pipe(v.string(), v.regex(/^literal:(.+)$/)),
		]),
		'any',
	),
	record: lexObject,
});

export const lexRecord = _lexRecord as lexRecord.$schema;
export interface LexRecord extends v.InferInput<typeof lexRecord> {}
export declare namespace lexRecord {
	export {};

	type $schematype = typeof _lexRecord;
	export interface $schema extends $schematype {}
}

const _lexUserType = v.variant('type', [
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
]);

export const lexUserType = _lexUserType as lexUserType.$schema;
export type LexUserType = v.InferInput<typeof lexUserType>;
export declare namespace lexUserType {
	export {};

	type $schematype = typeof _lexUserType;
	export interface $schema extends $schematype {}
}

const _lexiconDoc = v.strictObject({
	lexicon: v.literal(1),
	id: v.pipe(
		v.string(),
		v.regex(
			/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?:\.[a-zA-Z](?:[a-zA-Z0-9]{0,62})?)$/,
		),
	),
	revision: v.optional(integer),
	description: v.optional(v.string()),
	defs: v.record(v.pipe(v.string(), v.regex(/^[a-zA-Z][a-zA-Z0-9_]{0,62}?$/)), lexUserType),
});

export const lexiconDoc = v.pipe(
	_lexiconDoc,
	v.rawCheck(({ dataset, addIssue }) => {
		if (!dataset.typed) {
			return;
		}

		const { defs } = dataset.value;

		for (const defId in defs) {
			const def = defs[defId];

			if (
				defId !== 'main' &&
				(def.type === 'record' ||
					def.type === 'procedure' ||
					def.type === 'query' ||
					def.type === 'subscription')
			) {
				addIssue({
					message: `records, procedures, queries, and subscriptions must be the main definition.`,
					path: [
						{
							type: 'object',
							origin: 'value',
							input: dataset.value,
							key: 'defs',
							value: defs,
						},
						{
							type: 'object',
							origin: 'value',
							input: defs,
							key: defId,
							value: def,
						},
					],
				});
			}
		}
	}),
) as lexiconDoc.$schema;
export interface LexiconDoc extends v.InferInput<typeof lexiconDoc> {}
export declare namespace lexiconDoc {
	export {};

	type $schematype = typeof _lexiconDoc;
	export interface $schema extends $schematype {}
}
