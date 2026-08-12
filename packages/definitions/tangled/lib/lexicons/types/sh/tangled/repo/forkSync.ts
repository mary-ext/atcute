import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.forkSync', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Branch to sync */
			branch: /*#__PURE__*/ v.string(),
			/**
			 * DID of the fork owner. A knot without the repo-did-input capability reads this and name in place of
			 * repo.
			 */
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/**
			 * Name of the forked repository. A knot without the repo-did-input capability reads this and DID in
			 * place of repo.
			 */
			name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** DID of the fork to sync */
			repo: /*#__PURE__*/ v.didString(),
			/**
			 * AT-URI of the source repository. A knot without the repo-did-input capability requires this field
			 * without reading it.
			 */
			source: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'sh.tangled.repo.forkSync': mainSchema;
	}
}
