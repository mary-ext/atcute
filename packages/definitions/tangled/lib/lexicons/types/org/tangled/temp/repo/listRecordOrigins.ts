import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.repo.listRecordOrigins', {
	params: /*#__PURE__*/ v.object({
		/** A versioned collection, such as `org.tangled.track.ticket`. */
		collection: /*#__PURE__*/ v.nsidString(),
		/** Pass the cursor from one page into the next query to keep walking records. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @default 500
		 * @minimum 1
		 * @maximum 1000
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			500,
		),
		/** DID of the repository. */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			collection: /*#__PURE__*/ v.nsidString(),
			/** Left out when the page already reaches the last record. */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get origins() {
				return /*#__PURE__*/ v.array(originSchema);
			},
			repo: /*#__PURE__*/ v.didString(),
		}),
	},
});
const _originSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.repo.listRecordOrigins#origin')),
	/** The DID of the account that opened the record, the editor of its first version. */
	author: /*#__PURE__*/ v.didString(),
	/** Git Object ID of the change that opened the record. */
	changeId: /*#__PURE__*/ v.string(),
	/** When the knot wrote the opening change. Not the record's own `createdAt`. */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	rkey: /*#__PURE__*/ v.recordKeyString(),
});

type main$schematype = typeof _mainSchema;
type origin$schematype = typeof _originSchema;

export interface mainSchema extends main$schematype {}
export interface originSchema extends origin$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const originSchema = _originSchema as originSchema;

export interface Origin extends v.InferInput<typeof originSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.repo.listRecordOrigins': mainSchema;
	}
}
