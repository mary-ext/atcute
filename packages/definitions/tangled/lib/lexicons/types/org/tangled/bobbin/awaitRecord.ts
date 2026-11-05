import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.bobbin.awaitRecord', {
	params: /*#__PURE__*/ v.object({
		/**
		 * CID of the revision that was written, as returned by createRecord, putRecord or applyWrites. Omit it
		 * only when awaiting a delete, which has no CID. any other responds with whatever revision of the record
		 * settles first.
		 */
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		/** AT-URI of the record that was written. */
		uri: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** CID of the revision this result is about. */
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			/**
			 * Opaque error message which can be more detailed than the reason.
			 *
			 * @maxLength 200
			 */
			detail: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 200)]),
			),
			/** Why a rejected record will not appear. */
			reason: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<
					'missingBody' | 'notIndexed' | 'undecodable' | 'unknownCollection' | (string & {})
				>(),
			),
			/** What bobbin did with the record. */
			status: /*#__PURE__*/ v.string<'deleted' | 'indexed' | 'rejected' | (string & {})>(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.bobbin.awaitRecord': mainSchema;
	}
}
