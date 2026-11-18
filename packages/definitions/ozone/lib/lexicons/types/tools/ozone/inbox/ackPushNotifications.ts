import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _itemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.ackPushNotifications#item')),
	id: /*#__PURE__*/ v.integer(),
	/** @maxLength 64 */
	leaseToken: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 64)]),
});
const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.inbox.ackPushNotifications', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * @minLength 1
			 * @maxLength 100
			 */
			get items() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(itemSchema), [
					/*#__PURE__*/ v.arrayLength(1, 100),
				]);
			},
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			acknowledged: /*#__PURE__*/ v.array(/*#__PURE__*/ v.integer()),
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
		'tools.ozone.inbox.ackPushNotifications': mainSchema;
	}
}
