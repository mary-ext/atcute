import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledGitTempListLanguages from './listLanguages.ts';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp.listIndexedLanguages', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of repositories to return
		 *
		 * @default 500
		 * @minimum 1
		 * @maximum 1000
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			500,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get repos() {
				return /*#__PURE__*/ v.array(repoLanguagesSchema);
			},
		}),
	},
});
const _repoLanguagesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('sh.tangled.git.temp.listIndexedLanguages#repoLanguages'),
	),
	/** Default-branch commit the languages were indexed from */
	commit: /*#__PURE__*/ v.string(),
	/** Languages ordered by size, largest first */
	get languages() {
		return /*#__PURE__*/ v.array(ShTangledGitTempListLanguages.languageSchema);
	},
	/** DID of the repository */
	repo: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;
type repoLanguages$schematype = typeof _repoLanguagesSchema;

export interface mainSchema extends main$schematype {}
export interface repoLanguagesSchema extends repoLanguages$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const repoLanguagesSchema = _repoLanguagesSchema as repoLanguagesSchema;

export interface RepoLanguages extends v.InferInput<typeof repoLanguagesSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.git.temp.listIndexedLanguages': mainSchema;
	}
}
