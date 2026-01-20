import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.moderation.emitEvent', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			createdBy: /*#__PURE__*/ v.didString(),
			get event() {
				return /*#__PURE__*/ v.variant([
					ToolsOzoneModerationDefs.accountEventSchema,
					ToolsOzoneModerationDefs.ageAssuranceEventSchema,
					ToolsOzoneModerationDefs.ageAssuranceOverrideEventSchema,
					ToolsOzoneModerationDefs.cancelScheduledTakedownEventSchema,
					ToolsOzoneModerationDefs.identityEventSchema,
					ToolsOzoneModerationDefs.modEventAcknowledgeSchema,
					ToolsOzoneModerationDefs.modEventCommentSchema,
					ToolsOzoneModerationDefs.modEventDivertSchema,
					ToolsOzoneModerationDefs.modEventEmailSchema,
					ToolsOzoneModerationDefs.modEventEscalateSchema,
					ToolsOzoneModerationDefs.modEventLabelSchema,
					ToolsOzoneModerationDefs.modEventMuteSchema,
					ToolsOzoneModerationDefs.modEventMuteReporterSchema,
					ToolsOzoneModerationDefs.modEventPriorityScoreSchema,
					ToolsOzoneModerationDefs.modEventReportSchema,
					ToolsOzoneModerationDefs.modEventResolveAppealSchema,
					ToolsOzoneModerationDefs.modEventReverseTakedownSchema,
					ToolsOzoneModerationDefs.modEventTagSchema,
					ToolsOzoneModerationDefs.modEventTakedownSchema,
					ToolsOzoneModerationDefs.modEventUnmuteSchema,
					ToolsOzoneModerationDefs.modEventUnmuteReporterSchema,
					ToolsOzoneModerationDefs.recordEventSchema,
					ToolsOzoneModerationDefs.revokeAccountCredentialsEventSchema,
					ToolsOzoneModerationDefs.scheduleTakedownEventSchema,
				]);
			},
			/**
			 * An optional external ID for the event, used to deduplicate events from external systems. Fails when an event of same type with the same external ID exists for the same subject.
			 */
			externalId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get modTool() {
				return /*#__PURE__*/ v.optional(ToolsOzoneModerationDefs.modToolSchema);
			},
			get subject() {
				return /*#__PURE__*/ v.variant([
					ComAtprotoAdminDefs.repoRefSchema,
					ComAtprotoRepoStrongRef.mainSchema,
				]);
			},
			subjectBlobCids: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.cidString())),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneModerationDefs.modEventViewSchema;
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
		'tools.ozone.moderation.emitEvent': mainSchema;
	}
}
