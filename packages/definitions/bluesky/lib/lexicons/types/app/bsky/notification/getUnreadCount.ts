import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.notification.getUnreadCount', {
	params: /*#__PURE__*/ v.object({
		priority: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		seenAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			count: /*#__PURE__*/ v.integer(),
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
		'app.bsky.notification.getUnreadCount': mainSchema;
	}
}
