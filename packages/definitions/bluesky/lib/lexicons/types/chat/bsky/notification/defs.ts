import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _chatPreferenceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.notification.defs#chatPreference')),
	include: /*#__PURE__*/ v.string<'all' | 'follows' | (string & {})>(),
	push: /*#__PURE__*/ v.boolean(),
});
const _preferencesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.notification.defs#preferences')),
	get chat() {
		return chatPreferenceSchema;
	},
	get chatRequest() {
		return chatPreferenceSchema;
	},
});

type chatPreference$schematype = typeof _chatPreferenceSchema;
type preferences$schematype = typeof _preferencesSchema;

export interface chatPreferenceSchema extends chatPreference$schematype {}
export interface preferencesSchema extends preferences$schematype {}

export const chatPreferenceSchema = _chatPreferenceSchema as chatPreferenceSchema;
export const preferencesSchema = _preferencesSchema as preferencesSchema;

export interface ChatPreference extends v.InferInput<typeof chatPreferenceSchema> {}
export interface Preferences extends v.InferInput<typeof preferencesSchema> {}
