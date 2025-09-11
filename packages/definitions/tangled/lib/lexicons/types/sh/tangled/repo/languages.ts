import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _languageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.languages#language')),
	color: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	extensions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	fileCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	name: /*#__PURE__*/ v.string(),
	percentage: /*#__PURE__*/ v.integer(),
	size: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.languages', {
	params: /*#__PURE__*/ v.object({
		ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'HEAD'),
		repo: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get languages() {
				return /*#__PURE__*/ v.array(languageSchema);
			},
			ref: /*#__PURE__*/ v.string(),
			totalFiles: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
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
