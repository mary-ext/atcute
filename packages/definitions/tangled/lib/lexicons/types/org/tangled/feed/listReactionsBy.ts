import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledFeedListReactions from './listReactions.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.feed.listReactionsBy', {
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
		 * Absolute offset for random-access pagination. Mutually exclusive with cursor; offsets drift under
		 * concurrent writes, so follow up with the returned cursor.
		 *
		 * @minimum 0
		 */
		offset: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Sort direction by createdAt.
		 *
		 * @default 'desc'
		 */
		order: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'asc' | 'desc' | (string & {})>(), 'desc'),
		/** Actor DID whose reaction authorings to list. */
		subject: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get items() {
				return /*#__PURE__*/ v.array(OrgTangledFeedListReactions.listItemSchema);
			},
			/** Total items in the full list; omitted for filtered or merged views */
			total: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
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
		'org.tangled.feed.listReactionsBy': mainSchema;
	}
}
