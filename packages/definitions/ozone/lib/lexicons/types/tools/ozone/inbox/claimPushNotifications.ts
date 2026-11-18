import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneInboxDefs from './defs.ts';

const _itemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.claimPushNotifications#item')),
	category: /*#__PURE__*/ v.string<'account' | 'labels' | 'reports' | (string & {})>(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	id: /*#__PURE__*/ v.integer(),
	leaseToken: /*#__PURE__*/ v.string(),
	reason: /*#__PURE__*/ v.string(),
	recipientDid: /*#__PURE__*/ v.didString(),
	get target() {
		return /*#__PURE__*/ v.variant([
			ToolsOzoneInboxDefs.reportRefSchema,
			ToolsOzoneInboxDefs.standingRefSchema,
			ToolsOzoneInboxDefs.subjectRefSchema,
		]);
	},
});
const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.inbox.claimPushNotifications', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * @default 50
			 * @minimum 1
			 * @maximum 100
			 */
			limit: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
				50,
			),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * @minimum 0
			 * @maximum 100
			 */
			expired: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
			get notifications() {
				return /*#__PURE__*/ v.array(itemSchema);
			},
			/**
			 * @minimum 0
			 * @maximum 100
			 */
			processed: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
			/**
			 * @minimum 0
			 * @maximum 100
			 */
			suppressed: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [
				/*#__PURE__*/ v.integerRange(0, 100),
			]),
		}),
	},
});

type item$schematype = typeof _itemSchema;
type main$schematype = typeof _mainSchema;

export interface itemSchema extends item$schematype {}
export interface mainSchema extends main$schematype {}

export const itemSchema = _itemSchema as itemSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Item extends v.InferInput<typeof itemSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.inbox.claimPushNotifications': mainSchema;
	}
}
