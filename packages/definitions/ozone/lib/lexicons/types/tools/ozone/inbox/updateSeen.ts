import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.inbox.updateSeen', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** @minLength 1 */
			sections: /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.string<'accountStatus' | 'reports' | 'subjects' | (string & {})>(),
				),
				[/*#__PURE__*/ v.arrayLength(1)],
			),
			/**
			 * Mark each requested section read up to this instant. Defaults to server time and is clamped to server
			 * time when in the future. Newer existing watermarks are preserved independently for each section.
			 */
			seenAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The earliest resulting watermark across the requested sections, in UTC. Every requested section is
			 * read through this instant; individual sections may already have newer watermarks.
			 */
			seenAt: /*#__PURE__*/ v.datetimeString(),
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
		'tools.ozone.inbox.updateSeen': mainSchema;
	}
}
