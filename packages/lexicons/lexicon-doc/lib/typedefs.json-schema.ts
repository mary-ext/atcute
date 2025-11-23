import * as v from 'valibot';

import type * as t from './types.js';

const NSID_RE =
	/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\.[a-zA-Z][a-zA-Z0-9]{0,62}?$/;

const LANGUAGE_CODE_RE =
	/^((?<grandfathered>(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((?<language>([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-(?<script>[A-Za-z]{4}))?(-(?<region>[A-Za-z]{2}|[0-9]{3}))?(-(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-(?<extension>[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(?<privateUseA>x(-[A-Za-z0-9]{1,8})+))?)|(?<privateUseB>x(-[A-Za-z0-9]{1,8})+))$/;

const KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,62}?$/;

const REF_RE =
	/^(?=.)(?:[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\.[a-zA-Z][a-zA-Z0-9]{0,62}?)?(?:#[a-zA-Z][a-zA-Z0-9_]{0,62}?)?$/;

const DELIMITED_MIME_TYPE_RE =
	/^(?:\*\/\*|[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*(?:,\s*[a-z]+\/[a-zA-Z][a-zA-Z0-9-+.]*)*?)$/;

const MIME_TYPE_RE = /^[a-z]+\/(?:\*|[a-zA-Z][a-zA-Z0-9-+.]*)$/;

const integer = v.pipe(v.number(), v.integer());

// #region Concrete types
export const lexBoolean = v.object({
	type: v.literal('boolean'),
	description: v.optional(v.string()),
	default: v.optional(v.boolean()),
	const: v.optional(v.boolean()),
});

export const lexInteger = v.object({
	type: v.literal('integer'),
	description: v.optional(v.string()),
	default: v.optional(integer),
	minimum: v.optional(integer),
	maximum: v.optional(integer),
	enum: v.optional(v.array(integer)),
	const: v.optional(integer),
});

export const lexStringFormat = v.union([
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

export const lexString = v.object({
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

export const lexBytes = v.object({
	type: v.literal('bytes'),
	description: v.optional(v.string()),
	minLength: v.optional(integer),
	maxLength: v.optional(integer),
});

export const lexCidLink = v.object({
	type: v.literal('cid-link'),
	description: v.optional(v.string()),
});

export const lexBlob = v.object({
	type: v.literal('blob'),
	description: v.optional(v.string()),
	accept: v.optional(v.array(v.pipe(v.string(), v.regex(MIME_TYPE_RE)))),
	maxSize: v.optional(integer),
});

export const lexPrimitive = v.union([lexBoolean, lexInteger, lexString]);

export const lexConcrete = v.union([lexBoolean, lexInteger, lexString, lexBytes, lexCidLink, lexBlob]);
// #endregion

// #region Meta types
export const lexToken = v.object({
	type: v.literal('token'),
	description: v.optional(v.string()),
});

export const lexRef = v.object({
	type: v.literal('ref'),
	description: v.optional(v.string()),
	ref: v.pipe(v.string(), v.regex(REF_RE)),
});

export const lexRefUnion = v.object({
	type: v.literal('union'),
	description: v.optional(v.string()),
	refs: v.array(v.pipe(v.string(), v.regex(REF_RE))),
	closed: v.optional(v.boolean()),
});

export const lexUnknown = v.object({
	type: v.literal('unknown'),
	description: v.optional(v.string()),
});

export const lexRefVariant = v.union([lexRef, lexRefUnion]);

export const lexMeta = v.union([lexToken, lexRef, lexRefUnion, lexUnknown]);
// #endregion

// #region Container types
export const lexDefinableField: v.GenericSchema<t.LexDefinableField> = v.lazy(() => {
	return v.union([lexConcrete, lexRef, lexRefUnion, lexUnknown, lexArray]);
});

export const lexField: v.GenericSchema<t.LexField> = v.lazy(() => {
	return v.union([lexConcrete, lexMeta, lexContainer]);
});

export const lexArray = v.object({
	type: v.literal('array'),
	description: v.optional(v.string()),
	items: lexDefinableField,
	minLength: v.optional(integer),
	maxLength: v.optional(integer),
});

export const lexPrimitiveArray = v.object({
	type: v.literal('array'),
	description: v.optional(v.string()),
	items: lexPrimitive,
	minLength: v.optional(integer),
	maxLength: v.optional(integer),
});

export const lexObject = v.object({
	type: v.literal('object'),
	description: v.optional(v.string()),
	required: v.optional(v.array(v.string())),
	nullable: v.optional(v.array(v.string())),
	properties: v.optional(v.record(v.string(), lexDefinableField)),
});

export const lexContainer = v.union([lexArray, lexObject]);
// #endregion

// #region Miscellaneous
export const lexXrpcBody = v.object({
	description: v.optional(v.string()),
	encoding: v.pipe(v.string(), v.regex(DELIMITED_MIME_TYPE_RE)),
	schema: v.optional(v.union([lexRefVariant, lexObject])),
});

export const lexXrpcSubscriptionMessage = v.object({
	description: v.optional(v.string()),
	schema: v.optional(lexRefUnion),
});

export const lexXrpcError = v.object({
	name: v.string(),
	description: v.optional(v.string()),
});

export const lexLang = v.record(v.string(), v.string());
// #endregion

// #region Sub-types
export const lexXrpcParameters = v.object({
	type: v.literal('params'),
	description: v.optional(v.string()),
	required: v.optional(v.array(v.string())),
	properties: v.optional(v.record(v.string(), v.union([lexPrimitive, lexPrimitiveArray]))),
});

export const lexPermission = v.looseObject({
	type: v.literal('permission'),
	resource: v.string(),
});
// #endregion

// #region Primary types
export const lexRecord = v.object({
	type: v.literal('record'),
	description: v.optional(v.string()),
	key: v.optional(
		v.union([
			v.literal('tid'),
			v.literal('nsid'),
			v.literal('any'),
			v.pipe(v.string(), v.regex(/^literal:/)),
		]),
	),
	record: lexObject,
});

export const lexXrpcQuery = v.object({
	type: v.literal('query'),
	description: v.optional(v.string()),
	parameters: v.optional(lexXrpcParameters),
	output: v.optional(lexXrpcBody),
	errors: v.optional(v.array(lexXrpcError)),
});

export const lexXrpcProcedure = v.object({
	type: v.literal('procedure'),
	description: v.optional(v.string()),
	parameters: v.optional(lexXrpcParameters),
	input: v.optional(lexXrpcBody),
	output: v.optional(lexXrpcBody),
	errors: v.optional(v.array(lexXrpcError)),
});

export const lexXrpcSubscription = v.object({
	type: v.literal('subscription'),
	description: v.optional(v.string()),
	parameters: v.optional(lexXrpcParameters),
	message: v.optional(lexXrpcSubscriptionMessage),
	errors: v.optional(v.array(lexXrpcError)),
});

export const lexPermissionSet = v.object({
	type: v.literal('permission-set'),
	description: v.optional(v.string()),
	title: v.optional(v.string()),
	'title:lang': v.optional(lexLang),
	detail: v.optional(v.string()),
	'detail:lang': v.optional(lexLang),
	permissions: v.array(lexPermission),
});

export const lexPrimary = v.union([
	lexRecord,
	lexXrpcQuery,
	lexXrpcProcedure,
	lexXrpcSubscription,
	lexPermissionSet,
]);
// #endregion

// #region Document
export const lexUserType = v.union([lexPrimary, lexConcrete, lexToken, lexUnknown, lexContainer]);

export const lexiconDoc = v.object({
	lexicon: v.literal(1),
	id: v.pipe(v.string(), v.regex(NSID_RE)),
	revision: v.optional(integer),
	description: v.optional(v.string()),
	defs: v.record(v.string(), lexUserType),
});
// #endregion
