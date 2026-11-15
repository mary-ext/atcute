import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.space.listRepoOps', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor from a previous response. This one takes priority over `since` when both are given. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Max operations to return.
		 *
		 * @default 100
		 * @minimum 1
		 * @maximum 1000
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			100,
		),
		/**
		 * Request perations after this particular revision. Don't get it confused with pagination, use `cursor`
		 * for that.
		 */
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.tidString()),
		/** The private git repo's DID. */
		space: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Give as `cursor` to fetch the next page. This is left out when the response is at the newest
			 * operation.
			 */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get ops() {
				return /*#__PURE__*/ v.array(opEntrySchema);
			},
		}),
	},
});
const _opEntrySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.space.listRepoOps#opEntry')),
	action: /*#__PURE__*/ v.string<'create' | 'delete' | 'update' | (string & {})>(),
	/** Content ID of the record after the op. */
	cid: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.cidString()),
	collection: /*#__PURE__*/ v.nsidString(),
	/** Content ID of the record before the op. */
	prev: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.cidString()),
	rev: /*#__PURE__*/ v.tidString(),
	rkey: /*#__PURE__*/ v.recordKeyString(),
});

type main$schematype = typeof _mainSchema;
type opEntry$schematype = typeof _opEntrySchema;

export interface mainSchema extends main$schematype {}
export interface opEntrySchema extends opEntry$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const opEntrySchema = _opEntrySchema as opEntrySchema;

export interface OpEntry extends v.InferInput<typeof opEntrySchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.space.listRepoOps': mainSchema;
	}
}
