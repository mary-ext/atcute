import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.report.closeReports', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Reports of these types (fully qualified reason NSIDs) are excluded from closure and left unchanged.
			 * When omitted or empty, no report types are excluded.
			 */
			excludedReportTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			/**
			 * If true, also close reports on all subjects owned by the account, including records, messages, and
			 * conversations. Only valid when subject is an account DID.
			 *
			 * @default false
			 */
			includeAllOwned: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
			/** Optional moderator-only note recorded on each close activity. Not visible to reporters. */
			internalNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Set true when this action is triggered by an automated process. Defaults to false.
			 *
			 * @default false
			 */
			isAutomated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
			/**
			 * Optional metadata for the report activities. Lifecycle and resolution fields are controlled by the
			 * service.
			 */
			meta: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			/**
			 * If nonempty, only reports of the given report types (fully qualified reason NSIDs) are closed. When
			 * omitted or empty, all non-closed reports in the requested subject scope are targeted, except
			 * excludedReportTypes.
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
