import { isNsid, type Nsid } from '@atcute/lexicons/syntax';

import * as v from 'valibot';

import * as t from './types.ts';

const integer = v.pipe(
	v.number(),
	v.check((input) => input >= 0 && Number.isSafeInteger(input), `expected non-negative integer`),
);

const nsid: v.GenericSchema<unknown, Nsid> = v.pipe(
	v.string(),
	v.check((input) => isNsid(input), `expected valid nsid`),
	v.transform((value) => value as Nsid),
);

// #region Concrete types
export const lexBoolean: v.GenericSchema<unknown, t.LexBoolean> = v.looseObject({
	type: v.literal('boolean'),
	description: v.optional(v.string()),
	default: v.optional(v.boolean()),
	const: v.optional(v.boolean()),
});

export const lexInteger: v.GenericSchema<unknown, t.LexInteger> = v.looseObject({
	type: v.literal('integer'),
	description: v.optional(v.string()),
	default: v.optional(integer),
	minimum: v.optional(integer),
	maximum: v.optional(integer),
	enum: v.optional(v.array(integer)),
	const: v.optional(integer),
});

export const lexStringFormat: v.GenericSchema<unknown, t.LexStringFormat> = v.union([
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
]);

export const lexString: v.GenericSchema<unknown, t.LexString> = v.looseObject({
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

export const lexBytes: v.GenericSchema<unknown, t.LexBytes> = v.looseObject({
	type: v.literal('bytes'),
	description: v.optional(v.string()),
	minLength: v.optional(integer),
	maxLength: v.optional(integer),
});

export const lexCidLink: v.GenericSchema<unknown, t.LexCidLink> = v.looseObject({
	type: v.literal('cid-link'),
	description: v.optional(v.string()),
});

export const lexBlob: v.GenericSchema<unknown, t.LexBlob> = v.looseObject({
	type: v.literal('blob'),
	description: v.optional(v.string()),
	accept: v.optional(v.array(v.string())),
	maxSize: v.optional(integer),
});

export const lexPrimitive: v.GenericSchema<unknown, t.LexPrimitive> = v.union([
	lexBoolean,
	lexInteger,
	lexString,
]);

export const lexConcrete: v.GenericSchema<unknown, t.LexConcrete> = v.union([
	lexBoolean,
	lexInteger,
	lexString,
	lexBytes,
	lexCidLink,
	lexBlob,
]);
// #endregion

// #region Meta types
export const lexToken: v.GenericSchema<unknown, t.LexToken> = v.looseObject({
	type: v.literal('token'),
	description: v.optional(v.string()),
});

export const lexRef: v.GenericSchema<unknown, t.LexRef> = v.looseObject({
	type: v.literal('ref'),
	description: v.optional(v.string()),
	ref: v.string(),
});

export const lexRefUnion: v.GenericSchema<unknown, t.LexRefUnion> = v.looseObject({
	type: v.literal('union'),
	description: v.optional(v.string()),
	refs: v.array(v.string()),
	closed: v.optional(v.boolean()),
});

export const lexUnknown: v.GenericSchema<unknown, t.LexUnknown> = v.looseObject({
	type: v.literal('unknown'),
	description: v.optional(v.string()),
});

export const lexRefVariant: v.GenericSchema<unknown, t.LexRefVariant> = v.union([lexRef, lexRefUnion]);

export const lexMeta: v.GenericSchema<unknown, t.LexMeta> = v.union([
	lexToken,
	lexRef,
	lexRefUnion,
	lexUnknown,
]);
// #endregion

// #region Container types
export const lexDefinableField: v.GenericSchema<unknown, t.LexDefinableField> = v.lazy(() => {
	return v.union([lexConcrete, lexRef, lexRefUnion, lexUnknown, lexArray]);
});

export const lexField: v.GenericSchema<unknown, t.LexField> = v.lazy(() => {
	return v.union([lexConcrete, lexMeta, lexContainer]);
});

export const lexArray: v.GenericSchema<unknown, t.LexArray> = v.looseObject({
	type: v.literal('array'),
	description: v.optional(v.string()),
	items: lexDefinableField,
	minLength: v.optional(integer),
	maxLength: v.optional(integer),
});

export const lexPrimitiveArray: v.GenericSchema<unknown, t.LexPrimitiveArray> = v.looseObject({
	type: v.literal('array'),
	description: v.optional(v.string()),
	items: lexPrimitive,
	minLength: v.optional(integer),
	maxLength: v.optional(integer),
});

export const lexObject: v.GenericSchema<unknown, t.LexObject> = v.looseObject({
	type: v.literal('object'),
	description: v.optional(v.string()),
	required: v.optional(v.array(v.string())),
	nullable: v.optional(v.array(v.string())),
	properties: v.optional(v.record(v.string(), lexDefinableField)),
});

export const lexContainer = v.union([lexArray, lexObject]);
// #endregion

// #region Miscellaneous
export const lexXrpcBody: v.GenericSchema<unknown, t.LexXrpcBody> = v.looseObject({
	description: v.optional(v.string()),
	encoding: v.string(),
	schema: v.optional(v.union([lexRefVariant, lexObject])),
});

export const lexXrpcSubscriptionMessage: v.GenericSchema<unknown, t.LexXrpcSubscriptionMessage> =
	v.looseObject({
		description: v.optional(v.string()),
		schema: v.optional(lexRefUnion),
	});

export const lexXrpcError: v.GenericSchema<unknown, t.LexXrpcError> = v.looseObject({
	name: v.string(),
	description: v.optional(v.string()),
});

export const lexLang: v.GenericSchema<unknown, t.LexLang> = v.record(
	v.string(),
	v.union([v.undefined(), v.string()]),
);
// #endregion

// #region Sub-types
export const lexXrpcParameters: v.GenericSchema<unknown, t.LexXrpcParameters> = v.looseObject({
	type: v.literal('params'),
	description: v.optional(v.string()),
	required: v.optional(v.array(v.string())),
	properties: v.optional(v.record(v.string(), v.union([lexPrimitive, lexPrimitiveArray]))),
});

export const lexPermission: v.GenericSchema<unknown, t.LexPermission> = v.objectWithRest(
	{
		type: v.literal('permission'),
		resource: v.string(),
	},
	v.union([
		v.array(v.union([v.string(), integer, v.boolean()])),
		v.string(),
		integer,
		v.boolean(),
		v.undefined(),
	]),
);
// #endregion

// #region Primary types
export const lexRecord: v.GenericSchema<unknown, t.LexRecord> = v.looseObject({
	type: v.literal('record'),
	description: v.optional(v.string()),
	key: v.optional(
		v.union([
			v.literal('tid'),
			v.literal('nsid'),
			v.literal('any'),
			v.pipe(
				v.string(),
				v.check((input) => input.startsWith('literal:'), `invalid literal key`),
				v.transform((value) => value as `literal:${string}`),
			),
		]),
	),
	record: lexObject,
});

export const lexXrpcQuery: v.GenericSchema<unknown, t.LexXrpcQuery> = v.looseObject({
	type: v.literal('query'),
	description: v.optional(v.string()),
	parameters: v.optional(lexXrpcParameters),
	output: v.optional(lexXrpcBody),
	errors: v.optional(v.array(lexXrpcError)),
});

export const lexXrpcProcedure: v.GenericSchema<unknown, t.LexXrpcProcedure> = v.looseObject({
	type: v.literal('procedure'),
	description: v.optional(v.string()),
	parameters: v.optional(lexXrpcParameters),
	input: v.optional(lexXrpcBody),
	output: v.optional(lexXrpcBody),
	errors: v.optional(v.array(lexXrpcError)),
});

export const lexXrpcSubscription: v.GenericSchema<unknown, t.LexXrpcSubscription> = v.looseObject({
	type: v.literal('subscription'),
	description: v.optional(v.string()),
	parameters: v.optional(lexXrpcParameters),
	message: v.optional(lexXrpcSubscriptionMessage),
	errors: v.optional(v.array(lexXrpcError)),
});

export const lexPermissionSet: v.GenericSchema<unknown, t.LexPermissionSet> = v.looseObject({
	type: v.literal('permission-set'),
	description: v.optional(v.string()),
	title: v.optional(v.string()),
	'title:lang': v.optional(lexLang),
	detail: v.optional(v.string()),
	'detail:lang': v.optional(lexLang),
	permissions: v.array(lexPermission),
});

export const lexPrimary: v.GenericSchema<unknown, t.LexPrimary> = v.union([
	lexRecord,
	lexXrpcQuery,
	lexXrpcProcedure,
	lexXrpcSubscription,
	lexPermissionSet,
]);
// #endregion

// #region Document
export const lexUserType: v.GenericSchema<unknown, t.LexUserType> = v.union([
	lexPrimary,
	lexConcrete,
	lexToken,
	lexUnknown,
	lexContainer,
]);

export const lexiconDoc: v.GenericSchema<unknown, t.LexiconDoc> = v.looseObject({
	lexicon: v.literal(1),
	id: nsid,
	revision: v.optional(integer),
	description: v.optional(v.string()),
	defs: v.record(v.string(), lexUserType),
});
// #endregion
