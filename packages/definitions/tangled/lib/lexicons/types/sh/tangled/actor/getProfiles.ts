import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.actor.getProfiles', {
	params: /*#__PURE__*/ v.object({
		/**
		 * AT-URIs of the sh.tangled.actor.profile records to fetch. At most 50 per request.
		 *
		 * @minLength 1
		 * @maxLength 50
		 */
		actors: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()), [
			/*#__PURE__*/ v.arrayLength(1, 50),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get items() {
				return /*#__PURE__*/ v.array(recordViewSchema);
			},
		}),
	},
});
const _recordViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.actor.getProfiles#recordView')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	uri: /*#__PURE__*/ v.resourceUriString(),
	/** Embedded sh.tangled.actor.profile record. */
	value: /*#__PURE__*/ v.unknown(),
});

type main$schematype = typeof _mainSchema;
type recordView$schematype = typeof _recordViewSchema;

export interface mainSchema extends main$schematype {}
export interface recordViewSchema extends recordView$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const recordViewSchema = _recordViewSchema as recordViewSchema;

export interface RecordView extends v.InferInput<typeof recordViewSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.actor.getProfiles': mainSchema;
	}
}
