import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.moderation.listScheduledActions', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Cursor for pagination
			 */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Filter actions scheduled to execute before this time
			 */
			endsBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			/**
			 * Maximum number of results to return
			 * @minimum 1
			 * @maximum 100
			 * @default 50
			 */
			limit: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
				50,
			),
			/**
			 * Filter actions scheduled to execute after this time
			 */
			startsAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			/**
			 * Filter actions by status
			 * @minLength 1
			 */
			statuses: /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.string<'cancelled' | 'executed' | 'failed' | 'pending' | (string & {})>(),
				),
				[/*#__PURE__*/ v.arrayLength(1)],
			),
			/**
			 * Filter actions for specific DID subjects
			 * @maxLength 100
			 */
			subjects: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
					/*#__PURE__*/ v.arrayLength(0, 100),
				]),
			),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get actions() {
				return /*#__PURE__*/ v.array(ToolsOzoneModerationDefs.scheduledActionViewSchema);
			},
			/**
			 * Cursor for next page of results
			 */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'tools.ozone.moderation.listScheduledActions': mainSchema;
	}
}
