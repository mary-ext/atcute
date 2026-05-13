import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneReportDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.report.assignModerator', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** DID to be assigned. Defaults to the caller's DID. Admins may assign to any moderator. */
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/**
			 * When true, the assignment has no expiry (endAt is null). Throws AlreadyAssigned if another user
			 * already has a permanent assignment on this report.
			 */
			isPermanent: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Optional queue ID to associate the assignment with. If not provided and the report has been assigned
			 * on a queue before, it will stay on that queue.
			 */
			queueId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** The ID of the report to assign. */
			reportId: /*#__PURE__*/ v.integer(),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneReportDefs.assignmentViewSchema;
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
		'tools.ozone.report.assignModerator': mainSchema;
	}
}
