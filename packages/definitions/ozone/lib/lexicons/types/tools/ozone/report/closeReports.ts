import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.report.closeReports', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Optional moderator-only note recorded on each close activity. Not visible to reporters. */
			internalNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Set true when this action is triggered by an automated process. Defaults to false.
			 *
			 * @default false
			 */
			isAutomated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
			/**
			 * If specified, only reports of the given report types (fully qualified reason NSIDs) are closed. When
			 * omitted, all non-closed reports on the subject are targeted.
			 */
			reportTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			/** Subject DID (account-level reports) or AT-URI (record-level reports) whose reports should be closed. */
			subject: /*#__PURE__*/ v.genericUriString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Number of reports that were transitioned to closed. */
			closedCount: /*#__PURE__*/ v.integer(),
			/** IDs of the reports that were closed. */
			reportIds: /*#__PURE__*/ v.array(/*#__PURE__*/ v.integer()),
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
		'tools.ozone.report.closeReports': mainSchema;
	}
}
