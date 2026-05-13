import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneQueueDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.queue.getAssignments', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** If specified, returns assignments for these moderators only. */
		dids: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * When true, only returns active assignments.
		 *
		 * @default true
		 */
		onlyActive: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
		/** If specified, returns assignments for these queues only. */
		queueIds: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.integer())),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get assignments() {
				return /*#__PURE__*/ v.array(ToolsOzoneQueueDefs.assignmentViewSchema);
			},
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.queue.getAssignments': mainSchema;
	}
}
