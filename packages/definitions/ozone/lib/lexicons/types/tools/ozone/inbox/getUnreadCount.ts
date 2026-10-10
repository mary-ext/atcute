import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.inbox.getUnreadCount', {
	params: /*#__PURE__*/ v.object({
		/** Account to preview. Only Ozone staff can read another account; this does not change its read state. */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		section: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'accountStatus' | 'reports' | 'subjects' | (string & {})>(),
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get unreadCounts() {
				return unreadCountsSchema;
			},
		}),
	},
});
const _unreadCountsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.getUnreadCount#unreadCounts')),
	/**
	 * @minimum 0
	 * @maximum 1
	 */
	accountStatus: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 1)]),
	),
	/** @minimum 0 */
	reports: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** @minimum 0 */
	subjects: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** @minimum 0 */
	total: /*#__PURE__*/ v.integer(),
});

type main$schematype = typeof _mainSchema;
type unreadCounts$schematype = typeof _unreadCountsSchema;

export interface mainSchema extends main$schematype {}
export interface unreadCountsSchema extends unreadCounts$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const unreadCountsSchema = _unreadCountsSchema as unreadCountsSchema;

export interface UnreadCounts extends v.InferInput<typeof unreadCountsSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.inbox.getUnreadCount': mainSchema;
	}
}
