import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledCiDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.ci.getWorkflowDefinition', {
	params: /*#__PURE__*/ v.object({
		repo: /*#__PURE__*/ v.didString(),
		/**
		 * @minLength 1
		 * @maxLength 128
		 */
		workflow: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 128)]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get workflow() {
				return OrgTangledCiDefs.workflowSchema;
			},
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
		'org.tangled.ci.getWorkflowDefinition': mainSchema;
	}
}
