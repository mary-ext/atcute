import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _languageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.languages#language')),
	/**
	 * Hex color code for this language
	 */
	color: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * File extensions associated with this language
	 */
	extensions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	/**
	 * Number of files in this language
	 */
	fileCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * Programming language name
	 */
	name: /*#__PURE__*/ v.string(),
	/**
	 * Percentage of total codebase (0-100)
	 */
	percentage: /*#__PURE__*/ v.integer(),
	/**
	 * Total size of files in this language (bytes)
	 */
	size: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.languages', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Git reference (branch, tag, or commit SHA)
		 * @default "HEAD"
		 */
		ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'HEAD'),
		/**
		 * Repository identifier in format 'did:plc:.../repoName'
		 */
		repo: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get languages() {
				return /*#__PURE__*/ v.array(languageSchema);
			},
			/**
			 * The git reference used
			 */
			ref: /*#__PURE__*/ v.string(),
			/**
			 * Total number of files analyzed
			 */
			totalFiles: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Total size of all analyzed files in bytes
			 */
			totalSize: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		}),
	},
});

type language$schematype = typeof _languageSchema;
type main$schematype = typeof _mainSchema;

export interface languageSchema extends language$schematype {}
export interface mainSchema extends main$schematype {}

export const languageSchema = _languageSchema as languageSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Language extends v.InferInput<typeof languageSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.repo.languages': mainSchema;
	}
}
