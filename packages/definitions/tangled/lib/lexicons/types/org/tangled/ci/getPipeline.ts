import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledCiDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.ci.getPipeline', {
	params: /*#__PURE__*/ v.object({
		/** Spindle-local pipeline id */
		pipeline: /*#__PURE__*/ v.string(),
		/** Repository DID */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return OrgTangledCiDefs.pipelineSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.ci.getPipeline': mainSchema;
	}
}
