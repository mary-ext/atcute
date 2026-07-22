import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _listItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.graph.listFollows#listItem')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	uri: /*#__PURE__*/ v.resourceUriString(),
	/** Embedded sh.tangled.graph.follow record */
	value: /*#__PURE__*/ v.unknown(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.graph.listFollows', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 1000
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			50,
		),
		/**
		 * Sort direction by createdAt.
		 *
		 * @default 'desc'
		 */
		order: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'asc' | 'desc' | (string & {})>(), 'desc'),
		/** Followee DID whose inbound follows to list. */
		subject: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get items() {
				return /*#__PURE__*/ v.array(listItemSchema);
			},
		}),
	},
});

type listItem$schematype = typeof _listItemSchema;
type main$schematype = typeof _mainSchema;

export interface listItemSchema extends listItem$schematype {}
export interface mainSchema extends main$schematype {}

export const listItemSchema = _listItemSchema as listItemSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface ListItem extends v.InferInput<typeof listItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.graph.listFollows': mainSchema;
	}
}
