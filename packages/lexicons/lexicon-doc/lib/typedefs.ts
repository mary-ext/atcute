import * as v from '@badrap/valita';

import * as t from './types.js';

const integer = v
	.number()
	.assert((input) => input >= 0 && Number.isSafeInteger(input), `expected non-negative integer`);

export const lexBoolean: v.Type<t.LexBoolean> = v.object({
	type: v.literal('boolean'),
	description: v.string().optional(),
	default: v.boolean().optional(),
	const: v.boolean().optional(),
});

export const lexInteger: v.Type<t.LexInteger> = v.object({
	type: v.literal('integer'),
	description: v.string().optional(),
	default: integer.optional(),
	minimum: integer.optional(),
	maximum: integer.optional(),
	enum: v.array(integer).optional(),
	const: integer.optional(),
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

export const lexString: v.Type<t.LexString> = v.object({
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
});

export const lexUnknown: v.Type<t.LexUnknown> = v.object({
	type: v.literal('unknown'),
	description: v.string().optional(),
});

export const lexPrimitive: v.Type<t.LexPrimitive> = v.union(lexBoolean, lexInteger, lexString, lexUnknown);

export const lexBytes: v.Type<t.LexBytes> = v.object({
	type: v.literal('bytes'),
	description: v.string().optional(),
	minLength: integer.optional(),
	maxLength: integer.optional(),
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

export const lexRefUnion: v.Type<t.LexRefUnion> = v.object({
	type: v.literal('union'),
	description: v.string().optional(),
	refs: v.array(refString),
	closed: v.boolean().optional(),
});

export const lexRefVariant: v.Type<t.LexRefVariant> = v.union(lexRef, lexRefUnion);

export const lexBlob: v.Type<t.LexBlob> = v.object({
	type: v.literal('blob'),
	description: v.string().optional(),
	accept: v.array(v.string()).optional(),
	maxSize: integer.optional(),
});

export const lexArray: v.Type<t.LexArray> = v.object({
	type: v.literal('array'),
	description: v.string().optional(),
	items: v.union(lexPrimitive, lexIpldType, lexRefVariant, lexBlob),
	minLength: integer.optional(),
	maxLength: integer.optional(),
});

export const lexPrimitiveArray: v.Type<t.LexPrimitiveArray> = v.object({
	type: v.literal('array'),
	description: v.string().optional(),
	items: lexPrimitive,
	minLength: integer.optional(),
	maxLength: integer.optional(),
});

export const lexToken: v.Type<t.LexToken> = v.object({
	type: v.literal('token'),
	description: v.string().optional(),
});

export const lexObject: v.Type<t.LexObject> = v.object({
	type: v.literal('object'),
	description: v.string().optional(),
	required: v.array(v.string()).optional(),
	nullable: v.array(v.string()).optional(),
	properties: v.record(v.union(lexArray, lexPrimitive, lexIpldType, lexRefVariant, lexBlob)).optional(),
});

export const lexXrpcParameters: v.Type<t.LexXrpcParameters> = v.object({
	type: v.literal('params'),
	description: v.string().optional(),
	required: v.array(v.string()).optional(),
	properties: v.record(v.union(lexPrimitive, lexPrimitiveArray)).optional(),
});

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

export const lexLang: v.Type<t.LexLang> = v.record(v.union(v.undefined(), v.string()));

export const lexPermission: v.Type<t.LexPermission> = v
	.object({
		type: v.literal('permission'),
		resource: v.string().assert((s) => s.length > 0, `resource must not be empty`),
	})
	.rest(
		v.union(
			v.array(v.union(v.string(), integer, v.boolean())),
			v.string(),
			integer,
			v.boolean(),
			v.undefined(),
		),
	);

export const lexPermissionSet: v.Type<t.LexPermissionSet> = v.object({
	type: v.literal('permission-set'),
	description: v.string().optional(),
	title: v.string().optional(),
	'title:lang': lexLang.optional(),
	detail: v.string().optional(),
	'detail:lang': lexLang.optional(),
	permissions: v.array(lexPermission),
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
	lexPermissionSet,
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
	defs: v.record(lexUserType),
});
