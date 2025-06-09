import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyNotificationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.notification.putPreferencesV2', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get chat() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.chatPreferenceSchema);
			},
			get follow() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.filterablePreferenceSchema);
			},
			get like() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.filterablePreferenceSchema);
			},
			get likeViaRepost() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.filterablePreferenceSchema);
			},
			get mention() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.filterablePreferenceSchema);
			},
			get quote() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.filterablePreferenceSchema);
			},
			get reply() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.filterablePreferenceSchema);
			},
			get repost() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.filterablePreferenceSchema);
			},
			get repostViaRepost() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.filterablePreferenceSchema);
			},
			get starterpackJoined() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.preferenceSchema);
			},
			get subscribedPost() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.preferenceSchema);
			},
			get unverified() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.preferenceSchema);
			},
			get verified() {
				return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.preferenceSchema);
			},
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get preferences() {
				return AppBskyNotificationDefs.preferencesSchema;
			},
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
		'app.bsky.notification.putPreferencesV2': mainSchema;
	}
}
