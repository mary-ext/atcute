import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.repo.getImportStatus', {
	params: /*#__PURE__*/ v.object({
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Why a partial or failed import ended that way */
			reason: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Where the import from the source is. Omitted when the repository wasn't created from a source. */
			status: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<'failed' | 'fetching' | 'partial' | 'present' | (string & {})>(),
			),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.repo.getImportStatus': mainSchema;
	}
}
