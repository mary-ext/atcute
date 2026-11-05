import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTrackDefs from '../track/defs.ts';

const _hitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.search.query#hit')),
	/** Present for tickets. The account that opened the ticket, the editor of its first version. */
	author: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	/**
	 * Present for tickets.
	 *
	 * @minimum 0
	 */
	commentCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Collection of the matched record. */
	nsid: /*#__PURE__*/ v.nsidString(),
	/** Relevance score of the hit, a floating-point number where higher ranks first. */
	score: /*#__PURE__*/ v.unknown(),
	/** Present for tickets. */
	get state() {
		return /*#__PURE__*/ v.optional(OrgTangledTrackDefs.ticketStateSchema);
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
	/** Embedded matched record. */
	value: /*#__PURE__*/ v.unknown(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.search.query', {
	params: /*#__PURE__*/ v.object({
		/** Restrict to records authored by this DID. */
		author: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Restrict tickets to issues or pull requests. */
		kind: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'issue' | 'pull' | (string & {})>()),
		/**
		 * Restrict tickets to those with all of these label names. Requires repo.
		 *
		 * @maxLength 16
		 */
		label: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 256)]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 16)],
			),
		),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 1000
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			50,
		),
		/** Restrict to records of this collection. */
		nsid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nsidString()),
		/**
		 * Absolute offset for numbered pages. Mutually exclusive with cursor.
		 *
		 * @minimum 0
		 */
		offset: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Search query: free text plus key:value qualifiers. See the docs for more information.
		 *
		 * @maxLength 1024
		 */
		q: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1024)]),
		),
		/** Restrict to records under this repo DID. */
		repo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/** Restrict to records created at or after this time. */
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/** Result order. */
		sort: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'created-asc' | 'created-desc' | 'relevance' | (string & {})>(),
		),
		/** Restrict to records created at or before this time. */
		until: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get hits() {
				return /*#__PURE__*/ v.array(hitSchema);
			},
			/** Matches per ticket state, without the state filters. */
			get stateCounts() {
				return /*#__PURE__*/ v.optional(stateCountsSchema);
			},
			/**
			 * Number of matches across all pages.
			 *
			 * @minimum 0
			 */
			total: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		}),
	},
});
const _stateCountsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.search.query#stateCounts')),
	/** @minimum 0 */
	closed: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	completed: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	open: /*#__PURE__*/ v.integer(),
});

type hit$schematype = typeof _hitSchema;
type main$schematype = typeof _mainSchema;
type stateCounts$schematype = typeof _stateCountsSchema;

export interface hitSchema extends hit$schematype {}
export interface mainSchema extends main$schematype {}
export interface stateCountsSchema extends stateCounts$schematype {}

export const hitSchema = _hitSchema as hitSchema;
export const mainSchema = _mainSchema as mainSchema;
export const stateCountsSchema = _stateCountsSchema as stateCountsSchema;

export interface Hit extends v.InferInput<typeof hitSchema> {}
export interface StateCounts extends v.InferInput<typeof stateCountsSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.search.query': mainSchema;
	}
}
