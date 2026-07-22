import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.listPulls', {
	params: /*#__PURE__*/ v.object({
		/** Restrict to pulls authored by this user DID. */
		author: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
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
		/** Restrict to pulls whose latest derived status matches. */
		status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'closed' | 'merged' | 'open' | (string & {})>()),
		/** Repo DID to list pulls for */
		subject: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get items() {
				return /*#__PURE__*/ v.array(pullListItemSchema);
			},
		}),
	},
});
const _pullListItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.listPulls#pullListItem')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	/**
	 * Count of sh.tangled.repo.pull.comment records targeting this pull.
	 *
	 * @minimum 0
	 */
	commentCount: /*#__PURE__*/ v.integer(),
	/** Latest derived state. */
	state: /*#__PURE__*/ v.string<'closed' | 'merged' | 'open' | (string & {})>(),
	/** TID-derived timestamp of the latest pull status record. */
	stateUpdatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	uri: /*#__PURE__*/ v.resourceUriString(),
	/** Embedded sh.tangled.repo.pull record */
	value: /*#__PURE__*/ v.unknown(),
});

type main$schematype = typeof _mainSchema;
type pullListItem$schematype = typeof _pullListItemSchema;

export interface mainSchema extends main$schematype {}
export interface pullListItemSchema extends pullListItem$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const pullListItemSchema = _pullListItemSchema as pullListItemSchema;

export interface PullListItem extends v.InferInput<typeof pullListItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.repo.listPulls': mainSchema;
	}
}
