import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _chunkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.search.searchCode#chunk')),
	/** Source lines for this match chunk. */
	content: /*#__PURE__*/ v.string(),
	/** Byte-offset ranges within content that match the query. */
	get highlights() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(highlightSchema));
	},
	/** 1-based line number of the first line in content. */
	lineStart: /*#__PURE__*/ v.integer(),
});
const _fileResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.search.searchCode#fileResult')),
	get chunks() {
		return /*#__PURE__*/ v.array(chunkSchema);
	},
	/** Detected programming language. */
	language: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** File path relative to repository root. */
	path: /*#__PURE__*/ v.string(),
	/** DID of the repository as minted by the knot. */
	repoDid: /*#__PURE__*/ v.didString(),
});
const _highlightSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.search.searchCode#highlight')),
	/** End byte offset (exclusive) within the chunk content string. */
	end: /*#__PURE__*/ v.integer(),
	/** Start byte offset within the chunk content string. */
	start: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.search.searchCode', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Restrict search to a specific programming language (e.g. 'go', 'rust'). */
		lang: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
		),
		/** Search query string. */
		q: /*#__PURE__*/ v.string(),
		/** Restrict search to a specific repository, by its DID. */
		repoDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get results() {
				return /*#__PURE__*/ v.array(fileResultSchema);
			},
		}),
	},
});

type chunk$schematype = typeof _chunkSchema;
type fileResult$schematype = typeof _fileResultSchema;
type highlight$schematype = typeof _highlightSchema;
type main$schematype = typeof _mainSchema;

export interface chunkSchema extends chunk$schematype {}
export interface fileResultSchema extends fileResult$schematype {}
export interface highlightSchema extends highlight$schematype {}
export interface mainSchema extends main$schematype {}

export const chunkSchema = _chunkSchema as chunkSchema;
export const fileResultSchema = _fileResultSchema as fileResultSchema;
export const highlightSchema = _highlightSchema as highlightSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Chunk extends v.InferInput<typeof chunkSchema> {}
export interface FileResult extends v.InferInput<typeof fileResultSchema> {}
export interface Highlight extends v.InferInput<typeof highlightSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.search.searchCode': mainSchema;
	}
}
