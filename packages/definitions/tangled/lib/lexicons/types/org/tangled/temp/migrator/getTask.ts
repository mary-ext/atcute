import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTempMigratorDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.migrator.getTask', {
	params: /*#__PURE__*/ v.object({
		/** ID of the task to fetch. */
		taskId: /*#__PURE__*/ v.string(),
	}),
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

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.migrator.getTask': mainSchema;
	}
}
