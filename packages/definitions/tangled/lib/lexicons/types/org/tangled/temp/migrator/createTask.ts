import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTempMigratorDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.migrator.createTask', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** GitHub token for reading private source repositories. */
			githubToken: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * @minLength 1
			 * @maxLength 50
			 */
			get jobs() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(OrgTangledTempMigratorDefs.newJobSchema), [
					/*#__PURE__*/ v.arrayLength(1, 50),
				]);
			},
			/**
			 * Idempotency key for this task.
			 *
			 * @minLength 1
			 * @maxLength 128
			 */
			requestId: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 128)]),
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
		'org.tangled.temp.migrator.createTask': mainSchema;
	}
}
