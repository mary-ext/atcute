import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.repo.listRecords', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The NSID of the record type.
		 */
		collection: /*#__PURE__*/ v.nsidString(),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * The number of records to return.
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * The handle or DID of the repo.
		 */
		repo: /*#__PURE__*/ v.actorIdentifierString(),
		/**
		 * Flag to reverse the order of the returned records.
		 */
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
	cid: /*#__PURE__*/ v.cidString(),
	uri: /*#__PURE__*/ v.resourceUriString(),
	value: /*#__PURE__*/ v.unknown(),
});

type main$schematype = typeof _mainSchema;
type record$schematype = typeof _recordSchema;

export interface mainSchema extends main$schematype {}
export interface recordSchema extends record$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const recordSchema = _recordSchema as recordSchema;

export interface Record extends v.InferInput<typeof recordSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.repo.listRecords': mainSchema;
	}
}
