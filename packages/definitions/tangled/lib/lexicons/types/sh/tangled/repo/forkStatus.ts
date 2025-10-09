import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.forkStatus', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Branch to check status for
			 */
			branch: /*#__PURE__*/ v.string(),
			/**
			 * DID of the fork owner
			 */
			did: /*#__PURE__*/ v.didString(),
			/**
			 * Hidden ref to use for comparison
			 */
			hiddenRef: /*#__PURE__*/ v.string(),
			/**
			 * Name of the forked repository
			 */
			name: /*#__PURE__*/ v.string(),
			/**
			 * Source repository URL
			 */
			source: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Fork status: 0=UpToDate, 1=FastForwardable, 2=Conflict, 3=MissingBranch
			 */
			status: /*#__PURE__*/ v.integer(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'sh.tangled.repo.forkStatus': mainSchema;
	}
}
