import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.repo.listMissingBlobs', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 1000
		 * @default 500
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			500,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get blobs() {
				return /*#__PURE__*/ v.array(recordBlobSchema);
			},
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});
const _recordBlobSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.listMissingBlobs#recordBlob')),
	cid: /*#__PURE__*/ v.cidString(),
	recordUri: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type recordBlob$schematype = typeof _recordBlobSchema;

export interface mainSchema extends main$schematype {}
export interface recordBlobSchema extends recordBlob$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const recordBlobSchema = _recordBlobSchema as recordBlobSchema;

export interface RecordBlob extends v.InferInput<typeof recordBlobSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.repo.listMissingBlobs': mainSchema;
	}
}
