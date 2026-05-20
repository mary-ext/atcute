import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _languageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp.listLanguages#language')),
	/** Programming language name */
	name: /*#__PURE__*/ v.string(),
	/** Total size of files in this language (bytes) */
	size: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp.listLanguages', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Git reference (branch, tag, or commit SHA)
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
			/** The git reference used */
			ref: /*#__PURE__*/ v.string(),
			/** Total size of all analyzed files in bytes */
			total: /*#__PURE__*/ v.integer(),
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
		'sh.tangled.git.temp.listLanguages': mainSchema;
	}
}
