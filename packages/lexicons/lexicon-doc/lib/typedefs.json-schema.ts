import * as s from 'tschema';

import type * as t from './types.js';

const integer = s.integer({ minimum: 0 });

export const lexBoolean = s.object({
	type: s.constant('boolean'),
	description: s.optional(s.string()),
	default: s.optional(s.boolean()),
	const: s.optional(s.boolean()),
});

export const lexInteger = s.object({
	type: s.constant('integer'),
	description: s.optional(s.string()),
	default: s.optional(integer),
	minimum: s.optional(integer),
	maximum: s.optional(integer),
	enum: s.optional(s.array(integer)),
	const: s.optional(integer),
});

export const lexStringFormat = s.enum<t.LexStringFormat>([
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

export const lexString = s.object({
	type: s.constant('string'),
	format: s.optional(lexStringFormat),
	description: s.optional(s.string()),
	default: s.optional(s.string()),
	minLength: s.optional(integer),
	maxLength: s.optional(integer),
	minGraphemes: s.optional(integer),
	maxGraphemes: s.optional(integer),
	enum: s.optional(s.array(s.string())),
	const: s.optional(s.string()),
	knownValues: s.optional(s.array(s.string())),
});

export const lexUnknown = s.object({
	type: s.constant('unknown'),
	description: s.optional(s.string()),
});

export const lexPrimitive = s.any(lexBoolean, lexInteger, lexString, lexUnknown);

export const lexBytes = s.object({
	type: s.constant('bytes'),
	description: s.optional(s.string()),
	minLength: s.optional(integer),
	maxLength: s.optional(integer),
});

export const lexCidLink = s.object({
	type: s.constant('cid-link'),
	description: s.optional(s.string()),
});

export const lexIpldType = s.any(lexBytes, lexCidLink);

const REF_RE =
	/^(?=.)(?:[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\.[a-zA-Z][a-zA-Z0-9]{0,62}?)?(?:#[a-zA-Z][a-zA-Z0-9_]{0,62}?)?$/;

const refString = s.string({ pattern: REF_RE.source });

export const lexRef = s.object({
	type: s.constant('ref'),
	description: s.optional(s.string()),
	ref: refString,
});

export const lexRefUnion = s.object({
	type: s.constant('union'),
	description: s.optional(s.string()),
	refs: s.array(refString),
	closed: s.optional(s.boolean()),
});

export const lexRefVariant = s.any(lexRef, lexRefUnion);

export const lexBlob = s.object({
	type: s.constant('blob'),
	description: s.optional(s.string()),
	accept: s.optional(s.array(s.string())),
	maxSize: s.optional(integer),
});

export const lexArray = s.object({
	type: s.constant('array'),
	description: s.optional(s.string()),
	items: s.any(lexPrimitive, lexIpldType, lexRefVariant, lexBlob),
	minLength: s.optional(integer),
	maxLength: s.optional(integer),
});

export const lexPrimitiveArray = s.object({
	type: s.constant('array'),
	description: s.optional(s.string()),
	items: lexPrimitive,
	minLength: s.optional(integer),
	maxLength: s.optional(integer),
});

export const lexToken = s.object({
	type: s.constant('token'),
	description: s.optional(s.string()),
});

const KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,62}?$/;

export const lexObject = s.object({
	type: s.constant('object'),
	description: s.optional(s.string()),
	required: s.optional(s.array(s.string({ pattern: KEY_RE.source }))),
	nullable: s.optional(s.array(s.string({ pattern: KEY_RE.source }))),
	properties: s.optional(
		s.dict(s.any(lexArray, lexPrimitive, lexIpldType, lexRefVariant, lexBlob), {
			propertyNames: s.string({ pattern: KEY_RE.source }),
		}),
	),
});

export const lexXrpcParameters = s.object({
	type: s.constant('params'),
	description: s.optional(s.string()),
	required: s.optional(s.array(s.string({ pattern: KEY_RE.source }))),
	properties: s.optional(
		s.dict(s.any(lexPrimitive, lexPrimitiveArray), {
			propertyNames: s.string({ pattern: KEY_RE.source }),
		}),
	),
});

const MIME_TYPE_RE =
	/^\s*(?:\*\/\*|[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*)(?:\s*,\s*(?:\*\/\*|[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*))*\s*$/;

export const lexXrpcBody = s.object({
	description: s.optional(s.string()),
	encoding: s.string({ pattern: MIME_TYPE_RE.source }),
	schema: s.optional(s.any(lexRefVariant, lexObject)),
});

export const lexXrpcSubscriptionMessage = s.object({
	description: s.optional(s.string()),
	schema: s.optional(s.any(lexRefVariant, lexObject)),
});

export const lexXrpcError = s.object({
	name: s.string(),
	description: s.optional(s.string()),
});

export const lexXrpcQuery = s.object({
	type: s.constant('query'),
	description: s.optional(s.string()),
	parameters: s.optional(lexXrpcParameters),
	output: s.optional(lexXrpcBody),
	errors: s.optional(s.array(lexXrpcError)),
});

export const lexXrpcProcedure = s.object({
	type: s.constant('procedure'),
	description: s.optional(s.string()),
	parameters: s.optional(lexXrpcParameters),
	input: s.optional(lexXrpcBody),
	output: s.optional(lexXrpcBody),
	errors: s.optional(s.array(lexXrpcError)),
});

export const lexXrpcSubscription = s.object({
	type: s.constant('subscription'),
	description: s.optional(s.string()),
	parameters: s.optional(lexXrpcParameters),
	message: s.optional(lexXrpcSubscriptionMessage),
	errors: s.optional(s.array(lexXrpcError)),
});

export const lexRecord = s.object({
	type: s.constant('record'),
	description: s.optional(s.string()),
	key: s.optional(s.any(s.enum(['tid', 'nsid', 'any']), s.string({ pattern: '^literal:.+$' }))),
	record: lexObject,
});

export const lexUserType = s.any(
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

export const lexiconDoc = s.object(
	{
		lexicon: s.constant(1),
		id: s.string({ pattern: NSID_RE.source }),
		revision: s.optional(integer),
		description: s.optional(s.string()),
		defs: s.object(
			{ main: s.optional(lexUserType) },
			{
				propertyNames: s.string({ pattern: KEY_RE.source }),
				additionalProperties: s.any(lexObject, lexArray, lexToken, lexIpldType, lexBlob, lexPrimitive),
			},
		),
	},
	{
		additionalProperties: true,
	},
);
