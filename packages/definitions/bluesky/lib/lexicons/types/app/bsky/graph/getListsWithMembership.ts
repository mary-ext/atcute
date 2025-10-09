import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyGraphDefs from './defs.js';

const _listWithMembershipSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.graph.getListsWithMembership#listWithMembership'),
	),
	get list() {
		return AppBskyGraphDefs.listViewSchema;
	},
	get listItem() {
		return /*#__PURE__*/ v.optional(AppBskyGraphDefs.listItemViewSchema);
	},
});
const _mainSchema = /*#__PURE__*/ v.query('app.bsky.graph.getListsWithMembership', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The account (actor) to check for membership.
		 */
		actor: /*#__PURE__*/ v.actorIdentifierString(),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * Optional filter by list purpose. If not specified, all supported types are returned.
		 */
		purposes: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'curatelist' | 'modlist' | (string & {})>()),
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get listsWithMembership() {
				return /*#__PURE__*/ v.array(listWithMembershipSchema);
			},
		}),
	},
});

type listWithMembership$schematype = typeof _listWithMembershipSchema;
type main$schematype = typeof _mainSchema;

export interface listWithMembershipSchema extends listWithMembership$schematype {}
export interface mainSchema extends main$schematype {}

export const listWithMembershipSchema = _listWithMembershipSchema as listWithMembershipSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface ListWithMembership extends v.InferInput<typeof listWithMembershipSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.graph.getListsWithMembership': mainSchema;
	}
}
