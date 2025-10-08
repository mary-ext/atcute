import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneModerationDefs from './defs.js';

const _failedSchedulingSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.scheduleAction#failedScheduling'),
	),
	error: /*#__PURE__*/ v.string(),
	errorCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	subject: /*#__PURE__*/ v.didString(),
});
const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.moderation.scheduleAction', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get action() {
				return /*#__PURE__*/ v.variant([takedownSchema]);
			},
			createdBy: /*#__PURE__*/ v.didString(),
			get modTool() {
				return /*#__PURE__*/ v.optional(ToolsOzoneModerationDefs.modToolSchema);
			},
			get scheduling() {
				return schedulingConfigSchema;
			},
			subjects: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
				/*#__PURE__*/ v.arrayLength(0, 100),
			]),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return scheduledActionResultsSchema;
		},
	},
});
const _scheduledActionResultsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.scheduleAction#scheduledActionResults'),
	),
	get failed() {
		return /*#__PURE__*/ v.array(failedSchedulingSchema);
	},
	succeeded: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
});
const _schedulingConfigSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.scheduleAction#schedulingConfig'),
	),
	executeAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	executeAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	executeUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _takedownSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.scheduleAction#takedown')),
	acknowledgeAccountSubjects: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	durationInHours: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	policies: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
			/*#__PURE__*/ v.arrayLength(0, 5),
		]),
	),
});

type failedScheduling$schematype = typeof _failedSchedulingSchema;
type main$schematype = typeof _mainSchema;
type scheduledActionResults$schematype = typeof _scheduledActionResultsSchema;
type schedulingConfig$schematype = typeof _schedulingConfigSchema;
type takedown$schematype = typeof _takedownSchema;

export interface failedSchedulingSchema extends failedScheduling$schematype {}
export interface mainSchema extends main$schematype {}
export interface scheduledActionResultsSchema extends scheduledActionResults$schematype {}
export interface schedulingConfigSchema extends schedulingConfig$schematype {}
export interface takedownSchema extends takedown$schematype {}

export const failedSchedulingSchema = _failedSchedulingSchema as failedSchedulingSchema;
export const mainSchema = _mainSchema as mainSchema;
export const scheduledActionResultsSchema = _scheduledActionResultsSchema as scheduledActionResultsSchema;
export const schedulingConfigSchema = _schedulingConfigSchema as schedulingConfigSchema;
export const takedownSchema = _takedownSchema as takedownSchema;

export interface FailedScheduling extends v.InferInput<typeof failedSchedulingSchema> {}
export interface ScheduledActionResults extends v.InferInput<typeof scheduledActionResultsSchema> {}
export interface SchedulingConfig extends v.InferInput<typeof schedulingConfigSchema> {}
export interface Takedown extends v.InferInput<typeof takedownSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.moderation.scheduleAction': mainSchema;
	}
}
