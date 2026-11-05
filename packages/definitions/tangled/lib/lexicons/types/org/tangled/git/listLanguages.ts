import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _languageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.listLanguages#language')),
	/** Render color for this language */
	color: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** File extensions recognized as this language */
	extensions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	/**
	 * Files counted for this language
	 *
	 * @minimum 0
	 */
	fileCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Language name */
	name: /*#__PURE__*/ v.string(),
	/**
	 * Share of total size, 0-100
	 *
	 * @minimum 0
	 * @maximum 100
	 */
	percentage: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
	/**
	 * Bytes counted for this language
	 *
	 * @minimum 0
	 */
	size: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.git.listLanguages', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Git revision (branch, tag, or commit Object ID)
		 *
		 * @default 'HEAD'
		 */
		ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'HEAD'),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get languages() {
				return /*#__PURE__*/ v.array(languageSchema);
			},
			/** The ref the breakdown was computed at */
			ref: /*#__PURE__*/ v.string(),
			/**
			 * Total counted files
			 *
			 * @minimum 0
			 */
			totalFiles: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Total bytes across counted files
			 *
			 * @minimum 0
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
		'org.tangled.git.listLanguages': mainSchema;
	}
}
