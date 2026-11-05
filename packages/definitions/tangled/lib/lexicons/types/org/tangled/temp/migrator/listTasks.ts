import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTempMigratorDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.migrator.listTasks', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Maximum number of tasks to return.
		 *
		 * @default 20
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			20,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get tasks() {
				return /*#__PURE__*/ v.array(OrgTangledTempMigratorDefs.taskSchema);
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
		'org.tangled.temp.migrator.listTasks': mainSchema;
	}
}
