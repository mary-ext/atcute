import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.describeRepo', {
	params: /*#__PURE__*/ v.object({
		/** DID of the git repo as minted by the knot */
		repoDid: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** DID of the current owner according to the knot. */
			ownerDid: /*#__PURE__*/ v.didString(),
			repoDid: /*#__PURE__*/ v.didString(),
			/** Current rkey of the sh.tangled.repo record tracked by this knot */
			rkey: /*#__PURE__*/ v.recordKeyString(),
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
		'sh.tangled.repo.describeRepo': mainSchema;
	}
}
