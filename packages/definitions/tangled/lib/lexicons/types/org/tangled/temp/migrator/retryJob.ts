import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTempMigratorDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.migrator.retryJob', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** GitHub token for retrying a private repository. */
			githubToken: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** ID of the job to retry. */
			jobId: /*#__PURE__*/ v.string(),
			/** ID of the task the job belongs to. */
			taskId: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return OrgTangledTempMigratorDefs.taskSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.migrator.retryJob': mainSchema;
	}
}
