import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _countBySubjectSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('blue.microcosm.links.getManyToManyCounts#countBySubject'),
	),
	/**
	 * number of distinct DIDs linking to this subject
	 */
	distinct: /*#__PURE__*/ v.integer(),
	/**
	 * the secondary subject being counted
	 */
	subject: /*#__PURE__*/ v.string(),
	/**
	 * total number of links to this subject
	 */
	total: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.query('blue.microcosm.links.getManyToManyCounts', {
	params: /*#__PURE__*/ v.object({
		/**
		 * filter links to those from specific users
		 */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
		/**
		 * number of results to return
		 * @minimum 1
		 * @maximum 100
		 * @default 16
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			16,
		),
		/**
		 * filter secondary links to specific subjects
		 */
		otherSubject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * path to the secondary link in the many-to-many record (e.g., 'otherThing.uri')
		 */
		pathToOther: /*#__PURE__*/ v.string(),
		/**
		 * collection and path specification for the primary link
		 */
		source: /*#__PURE__*/ v.string(),
		/**
		 * the primary target being linked to (at-uri, did, or uri)
		 */
		subject: /*#__PURE__*/ v.genericUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get counts_by_other_subject() {
				return /*#__PURE__*/ v.array(countBySubjectSchema);
			},
			/**
			 * pagination cursor
			 */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});

type countBySubject$schematype = typeof _countBySubjectSchema;
type main$schematype = typeof _mainSchema;

export interface countBySubjectSchema extends countBySubject$schematype {}
export interface mainSchema extends main$schematype {}

export const countBySubjectSchema = _countBySubjectSchema as countBySubjectSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface CountBySubject extends v.InferInput<typeof countBySubjectSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'blue.microcosm.links.getManyToManyCounts': mainSchema;
	}
}
