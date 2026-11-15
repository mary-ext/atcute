import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneModerationDefs from '../moderation/defs.ts';

import * as ToolsOzoneReportDefs from './defs.ts';

const _activityRowSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.report.queryModeratorActivity#activityRow'),
	),
	actionEventId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get activity() {
		return /*#__PURE__*/ v.optional(ToolsOzoneReportDefs.reportActivityViewSchema);
	},
	createdAt: /*#__PURE__*/ v.datetimeString(),
	createdBy: /*#__PURE__*/ v.didString(),
	get event() {
		return /*#__PURE__*/ v.optional(ToolsOzoneModerationDefs.modEventViewSchema);
	},
	id: /*#__PURE__*/ v.integer(),
	reportId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	source: /*#__PURE__*/ v.literalEnum(['activity', 'event']),
	subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	type: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.report.queryModeratorActivity', {
	params: /*#__PURE__*/ v.object({
		/** Inclusive UTC lower bound. */
		createdAfter: /*#__PURE__*/ v.datetimeString(),
		/** Exclusive UTC upper bound. */
		createdBefore: /*#__PURE__*/ v.datetimeString(),
		/** @maxLength 512 */
		cursor: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 512)]),
		),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		moderator: /*#__PURE__*/ v.didString(),
		/** @maxLength 40 */
		types: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
				/*#__PURE__*/ v.arrayLength(0, 40),
			]),
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get rows() {
				return /*#__PURE__*/ v.array(activityRowSchema);
			},
		}),
	},
});

type activityRow$schematype = typeof _activityRowSchema;
type main$schematype = typeof _mainSchema;

export interface activityRowSchema extends activityRow$schematype {}
export interface mainSchema extends main$schematype {}

export const activityRowSchema = _activityRowSchema as activityRowSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface ActivityRow extends v.InferInput<typeof activityRowSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.report.queryModeratorActivity': mainSchema;
	}
}
