import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.moderation.listScheduledActions', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			endsBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			limit: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
				50,
			),
			startsAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			statuses: /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.string<'cancelled' | 'executed' | 'failed' | 'pending' | (string & {})>(),
				),
				[/*#__PURE__*/ v.arrayLength(1)],
			),
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
