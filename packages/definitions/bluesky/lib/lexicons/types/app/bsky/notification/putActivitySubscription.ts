import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyNotificationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.notification.putActivitySubscription', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get activitySubscription() {
				return AppBskyNotificationDefs.activitySubscriptionSchema;
			},
			subject: /*#__PURE__*/ v.didString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get activitySubscription() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.activitySubscriptionSchema);
			},
			subject: /*#__PURE__*/ v.didString(),
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
		'app.bsky.notification.putActivitySubscription': mainSchema;
	}
}
