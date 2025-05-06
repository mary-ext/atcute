import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.repo.listRecords', {
	params: /*#__PURE__*/ v.object({
		repo: /*#__PURE__*/ v.actorIdentifierString(),
		collection: /*#__PURE__*/ v.nsidString(),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		reverse: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get records() {
				return /*#__PURE__*/ v.array(recordSchema);
			},
		}),
	},
});
const _recordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.listRecords#record')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.unknown(),
});

type main$schematype = typeof _mainSchema;
type record$schematype = typeof _recordSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}
/** @deprecated */
export interface record$schema extends record$schematype {}

export const mainSchema = _mainSchema as main$schema;
export const recordSchema = _recordSchema as record$schema;

export interface Record extends v.InferInput<typeof recordSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.repo.listRecords': main$schema;
	}
}
