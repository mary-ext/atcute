import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.hiddenRef', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Fork reference name */
			forkRef: /*#__PURE__*/ v.string(),
			/** Remote reference name */
			remoteRef: /*#__PURE__*/ v.string(),
			/** AT-URI of the repository */
			repo: /*#__PURE__*/ v.resourceUriString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Error message if creation failed */
			error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** The created hidden ref name */
			ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Whether the hidden ref was created successfully */
			success: /*#__PURE__*/ v.boolean(),
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
		'sh.tangled.repo.hiddenRef': mainSchema;
	}
}
