import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.git.formatPatch', {
	params: /*#__PURE__*/ v.object({
		/** Revision the series starts after (exclusive) */
		from: /*#__PURE__*/ v.string(),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
		/** Revision the series ends at (inclusive) */
		to: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'blob',
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.git.formatPatch': mainSchema;
	}
}
