import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.moderation.getAccountTimeline', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get timeline() {
				return /*#__PURE__*/ v.array(timelineItemSchema);
			},
		}),
	},
});
const _timelineItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.getAccountTimeline#timelineItem'),
	),
	day: /*#__PURE__*/ v.string(),
	get summary() {
		return /*#__PURE__*/ v.array(timelineItemSummarySchema);
	},
});
const _timelineItemSummarySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.getAccountTimeline#timelineItemSummary'),
	),
	count: /*#__PURE__*/ v.integer(),
	eventSubjectType: /*#__PURE__*/ v.string<'account' | 'chat' | 'record' | (string & {})>(),
	eventType: /*#__PURE__*/ v.string<
		| 'tools.ozone.hosting.getAccountHistory#accountCreated'
		| 'tools.ozone.hosting.getAccountHistory#emailConfirmed'
		| 'tools.ozone.hosting.getAccountHistory#handleUpdated'
		| 'tools.ozone.hosting.getAccountHistory#passwordUpdated'
		| 'tools.ozone.moderation.defs#accountEvent'
		| 'tools.ozone.moderation.defs#ageAssuranceEvent'
		| 'tools.ozone.moderation.defs#ageAssuranceOverrideEvent'
		| 'tools.ozone.moderation.defs#identityEvent'
		| 'tools.ozone.moderation.defs#modEventAcknowledge'
		| 'tools.ozone.moderation.defs#modEventComment'
		| 'tools.ozone.moderation.defs#modEventDivert'
		| 'tools.ozone.moderation.defs#modEventEmail'
		| 'tools.ozone.moderation.defs#modEventEscalate'
		| 'tools.ozone.moderation.defs#modEventLabel'
		| 'tools.ozone.moderation.defs#modEventMute'
		| 'tools.ozone.moderation.defs#modEventMuteReporter'
		| 'tools.ozone.moderation.defs#modEventPriorityScore'
		| 'tools.ozone.moderation.defs#modEventReport'
		| 'tools.ozone.moderation.defs#modEventResolveAppeal'
		| 'tools.ozone.moderation.defs#modEventReverseTakedown'
		| 'tools.ozone.moderation.defs#modEventTag'
		| 'tools.ozone.moderation.defs#modEventTakedown'
		| 'tools.ozone.moderation.defs#modEventUnmute'
		| 'tools.ozone.moderation.defs#modEventUnmuteReporter'
		| 'tools.ozone.moderation.defs#recordEvent'
		| 'tools.ozone.moderation.defs#revokeAccountCredentialsEvent'
		| 'tools.ozone.moderation.defs#timelineEventPlcCreate'
		| 'tools.ozone.moderation.defs#timelineEventPlcOperation'
		| 'tools.ozone.moderation.defs#timelineEventPlcTombstone'
		| (string & {})
	>(),
});

type main$schematype = typeof _mainSchema;
type timelineItem$schematype = typeof _timelineItemSchema;
type timelineItemSummary$schematype = typeof _timelineItemSummarySchema;

export interface mainSchema extends main$schematype {}
export interface timelineItemSchema extends timelineItem$schematype {}
export interface timelineItemSummarySchema extends timelineItemSummary$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const timelineItemSchema = _timelineItemSchema as timelineItemSchema;
export const timelineItemSummarySchema = _timelineItemSummarySchema as timelineItemSummarySchema;

export interface TimelineItem extends v.InferInput<typeof timelineItemSchema> {}
export interface TimelineItemSummary extends v.InferInput<typeof timelineItemSummarySchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.moderation.getAccountTimeline': mainSchema;
	}
}
