import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneModerationDefs from './defs.ts';
import * as ToolsOzoneModerationEmitEvent from './emitEvent.ts';

const _failedEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.emitEvents#failedEvent')),
	/** Error message describing the reason for failure. */
	error: /*#__PURE__*/ v.string(),
	/** Typed error identifier for programmatic handling. Omitted when the error is unexpected/uncategorized. */
	errorName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			| 'AlreadyTakendown'
			| 'DuplicateExternalId'
			| 'InvalidConfiguration'
			| 'InvalidRequest'
			| 'InvalidSubject'
			| 'NotTakendown'
			| 'SubjectHasAction'
			| (string & {})
		>(),
	),
	/** The subject from the failed event input. */
	get subject() {
		return /*#__PURE__*/ v.variant([ComAtprotoAdminDefs.repoRefSchema, ComAtprotoRepoStrongRef.mainSchema]);
	},
});
const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.moderation.emitEvents', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			createdBy: /*#__PURE__*/ v.didString(),
			get event() {
				return /*#__PURE__*/ v.variant([
					ToolsOzoneModerationDefs.modEventAcknowledgeSchema,
					ToolsOzoneModerationDefs.modEventEmailSchema,
					ToolsOzoneModerationDefs.modEventLabelSchema,
					ToolsOzoneModerationDefs.modEventReportSchema,
					ToolsOzoneModerationDefs.modEventResolveAppealSchema,
					ToolsOzoneModerationDefs.modEventReverseTakedownSchema,
					ToolsOzoneModerationDefs.modEventTagSchema,
					ToolsOzoneModerationDefs.modEventTakedownSchema,
					ToolsOzoneModerationDefs.revokeAccountCredentialsEventSchema,
				]);
			},
			get modTool() {
				return /*#__PURE__*/ v.optional(ToolsOzoneModerationDefs.modToolSchema);
			},
			/**
			 * Array of subjects to apply the moderation event to.
			 *
			 * @maxLength 100
			 */
			get subjects() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(subjectEntrySchema), [
					/*#__PURE__*/ v.arrayLength(0, 100),
				]);
			},
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Successfully processed moderation events. */
			get events() {
				return /*#__PURE__*/ v.array(ToolsOzoneModerationDefs.modEventViewSchema);
			},
			/** Events that failed to process. */
			get failedEvents() {
				return /*#__PURE__*/ v.array(failedEventSchema);
			},
		}),
	},
});
const _subjectEntrySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.emitEvents#subjectEntry')),
	/** Deduplicate events of this type for this subject using an external ID. */
	externalId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Optional report-level targeting for this subject. Links the event to matching reports and may notify
	 * reporters.
	 */
	get reportAction() {
		return /*#__PURE__*/ v.optional(ToolsOzoneModerationEmitEvent.reportActionSchema);
	},
	get subject() {
		return /*#__PURE__*/ v.variant([ComAtprotoAdminDefs.repoRefSchema, ComAtprotoRepoStrongRef.mainSchema]);
	},
	subjectBlobCids: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.cidString())),
});

type failedEvent$schematype = typeof _failedEventSchema;
type main$schematype = typeof _mainSchema;
type subjectEntry$schematype = typeof _subjectEntrySchema;

export interface failedEventSchema extends failedEvent$schematype {}
export interface mainSchema extends main$schematype {}
export interface subjectEntrySchema extends subjectEntry$schematype {}

export const failedEventSchema = _failedEventSchema as failedEventSchema;
export const mainSchema = _mainSchema as mainSchema;
export const subjectEntrySchema = _subjectEntrySchema as subjectEntrySchema;

export interface FailedEvent extends v.InferInput<typeof failedEventSchema> {}
export interface SubjectEntry extends v.InferInput<typeof subjectEntrySchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.moderation.emitEvents': mainSchema;
	}
}
