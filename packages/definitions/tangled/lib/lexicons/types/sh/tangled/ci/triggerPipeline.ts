import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledCiTrigger from './trigger.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.ci.triggerPipeline', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Target repository DID. Auth is checked against this repo. */
			repo: /*#__PURE__*/ v.didString(),
			/** Trigger metadata for this dispatch. */
			get trigger() {
				return /*#__PURE__*/ v.variant([
					ShTangledCiTrigger.manualSchema,
					ShTangledCiTrigger.pullRequestSchema,
				]);
			},
			/** Workflow names to run. When not provided, every dispatchable workflow is run. */
			workflows: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** AT-URI of the created pipeline */
			pipeline: /*#__PURE__*/ v.resourceUriString(),
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
		'sh.tangled.ci.triggerPipeline': mainSchema;
	}
}
