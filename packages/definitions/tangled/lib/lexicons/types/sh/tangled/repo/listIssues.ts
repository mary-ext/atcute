import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _issueListItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.listIssues#issueListItem')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	/**
	 * Count of sh.tangled.repo.issue.comment records targeting this issue.
	 *
	 * @minimum 0
	 */
	commentCount: /*#__PURE__*/ v.integer(),
	/** Latest derived state. */
	state: /*#__PURE__*/ v.string<'closed' | 'open' | (string & {})>(),
	/** TID-derived timestamp of the latest state record. */
	stateUpdatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	uri: /*#__PURE__*/ v.resourceUriString(),
	/** Embedded sh.tangled.repo.issue record */
	value: /*#__PURE__*/ v.unknown(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.listIssues', {
	params: /*#__PURE__*/ v.object({
		/** Restrict to issues authored by this user DID. */
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
		/** Restrict to issues whose latest derived state matches. */
		state: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'closed' | 'open' | (string & {})>()),
		/** Repo DID to list issues for */
		subject: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get items() {
				return /*#__PURE__*/ v.array(issueListItemSchema);
			},
		}),
	},
});

type issueListItem$schematype = typeof _issueListItemSchema;
type main$schematype = typeof _mainSchema;

export interface issueListItemSchema extends issueListItem$schematype {}
export interface mainSchema extends main$schematype {}

export const issueListItemSchema = _issueListItemSchema as issueListItemSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface IssueListItem extends v.InferInput<typeof issueListItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.repo.listIssues': mainSchema;
	}
}
