import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.moderation.emitEvent', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get event() {
				return /*#__PURE__*/ v.variant([
					ToolsOzoneModerationDefs.modEventTakedownSchema,
					ToolsOzoneModerationDefs.modEventAcknowledgeSchema,
					ToolsOzoneModerationDefs.modEventEscalateSchema,
					ToolsOzoneModerationDefs.modEventCommentSchema,
					ToolsOzoneModerationDefs.modEventLabelSchema,
					ToolsOzoneModerationDefs.modEventReportSchema,
					ToolsOzoneModerationDefs.modEventMuteSchema,
					ToolsOzoneModerationDefs.modEventUnmuteSchema,
					ToolsOzoneModerationDefs.modEventMuteReporterSchema,
					ToolsOzoneModerationDefs.modEventUnmuteReporterSchema,
					ToolsOzoneModerationDefs.modEventReverseTakedownSchema,
					ToolsOzoneModerationDefs.modEventResolveAppealSchema,
					ToolsOzoneModerationDefs.modEventEmailSchema,
					ToolsOzoneModerationDefs.modEventDivertSchema,
					ToolsOzoneModerationDefs.modEventTagSchema,
					ToolsOzoneModerationDefs.accountEventSchema,
					ToolsOzoneModerationDefs.identityEventSchema,
					ToolsOzoneModerationDefs.recordEventSchema,
					ToolsOzoneModerationDefs.modEventPriorityScoreSchema,
				]);
			},
			get subject() {
				return /*#__PURE__*/ v.variant([
					ComAtprotoAdminDefs.repoRefSchema,
					ComAtprotoRepoStrongRef.mainSchema,
				]);
			},
			subjectBlobCids: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.cidString())),
			createdBy: /*#__PURE__*/ v.didString(),
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

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.moderation.emitEvent': mainSchema;
	}
}
