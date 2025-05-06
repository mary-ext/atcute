import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.repo.listMissingBlobs', {
	params: /*#__PURE__*/ v.object({
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			500,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get blobs() {
				return /*#__PURE__*/ v.array(recordBlobSchema);
			},
		}),
	},
});
const _recordBlobSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.listMissingBlobs#recordBlob')),
	cid: /*#__PURE__*/ v.string(),
	recordUri: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type recordBlob$schematype = typeof _recordBlobSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}
/** @deprecated */
export interface recordBlob$schema extends recordBlob$schematype {}

export const mainSchema = _mainSchema as main$schema;
export const recordBlobSchema = _recordBlobSchema as recordBlob$schema;

export interface RecordBlob extends v.InferInput<typeof recordBlobSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.repo.listMissingBlobs': main$schema;
	}
}
