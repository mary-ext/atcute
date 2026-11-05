import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledCiDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.ci.listWorkflowDefinitions', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @default 'HEAD'
		 * @maxLength 256
		 */
		ref: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 256)]),
			'HEAD',
		),
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get workflows() {
				return /*#__PURE__*/ v.array(OrgTangledCiDefs.workflowSchema);
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
		'org.tangled.ci.listWorkflowDefinitions': mainSchema;
	}
}
