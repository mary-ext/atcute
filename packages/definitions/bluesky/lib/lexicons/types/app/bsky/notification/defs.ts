import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _activitySubscriptionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.notification.defs#activitySubscription')),
	post: /*#__PURE__*/ v.boolean(),
	reply: /*#__PURE__*/ v.boolean(),
});
const _chatPreferenceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.notification.defs#chatPreference')),
	include: /*#__PURE__*/ v.string<'accepted' | 'all' | (string & {})>(),
	push: /*#__PURE__*/ v.boolean(),
});
const _filterablePreferenceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.notification.defs#filterablePreference')),
	include: /*#__PURE__*/ v.string<'all' | 'follows' | (string & {})>(),
	list: /*#__PURE__*/ v.boolean(),
	push: /*#__PURE__*/ v.boolean(),
});
const _preferenceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.notification.defs#preference')),
	list: /*#__PURE__*/ v.boolean(),
	push: /*#__PURE__*/ v.boolean(),
});
const _preferencesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.notification.defs#preferences')),
	get chat() {
		return chatPreferenceSchema;
	},
	get follow() {
		return filterablePreferenceSchema;
	},
	get like() {
		return filterablePreferenceSchema;
	},
	get likeViaRepost() {
		return filterablePreferenceSchema;
	},
	get mention() {
		return filterablePreferenceSchema;
	},
	get quote() {
		return filterablePreferenceSchema;
	},
	get reply() {
		return filterablePreferenceSchema;
	},
	get repost() {
		return filterablePreferenceSchema;
	},
	get repostViaRepost() {
		return filterablePreferenceSchema;
	},
	get starterpackJoined() {
		return preferenceSchema;
	},
	get subscribedPost() {
		return preferenceSchema;
	},
	get unverified() {
		return preferenceSchema;
	},
	get verified() {
		return preferenceSchema;
	},
});
const _recordDeletedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.notification.defs#recordDeleted')),
});
const _subjectActivitySubscriptionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.defs#subjectActivitySubscription'),
	),
	get activitySubscription() {
		return activitySubscriptionSchema;
	},
	subject: /*#__PURE__*/ v.didString(),
});

type activitySubscription$schematype = typeof _activitySubscriptionSchema;
type chatPreference$schematype = typeof _chatPreferenceSchema;
type filterablePreference$schematype = typeof _filterablePreferenceSchema;
type preference$schematype = typeof _preferenceSchema;
type preferences$schematype = typeof _preferencesSchema;
type recordDeleted$schematype = typeof _recordDeletedSchema;
type subjectActivitySubscription$schematype = typeof _subjectActivitySubscriptionSchema;

export interface activitySubscriptionSchema extends activitySubscription$schematype {}
export interface chatPreferenceSchema extends chatPreference$schematype {}
export interface filterablePreferenceSchema extends filterablePreference$schematype {}
export interface preferenceSchema extends preference$schematype {}
export interface preferencesSchema extends preferences$schematype {}
export interface recordDeletedSchema extends recordDeleted$schematype {}
export interface subjectActivitySubscriptionSchema extends subjectActivitySubscription$schematype {}

export const activitySubscriptionSchema = _activitySubscriptionSchema as activitySubscriptionSchema;
export const chatPreferenceSchema = _chatPreferenceSchema as chatPreferenceSchema;
export const filterablePreferenceSchema = _filterablePreferenceSchema as filterablePreferenceSchema;
export const preferenceSchema = _preferenceSchema as preferenceSchema;
export const preferencesSchema = _preferencesSchema as preferencesSchema;
export const recordDeletedSchema = _recordDeletedSchema as recordDeletedSchema;
export const subjectActivitySubscriptionSchema =
	_subjectActivitySubscriptionSchema as subjectActivitySubscriptionSchema;

export interface ActivitySubscription extends v.InferInput<typeof activitySubscriptionSchema> {}
export interface ChatPreference extends v.InferInput<typeof chatPreferenceSchema> {}
export interface FilterablePreference extends v.InferInput<typeof filterablePreferenceSchema> {}
export interface Preference extends v.InferInput<typeof preferenceSchema> {}
export interface Preferences extends v.InferInput<typeof preferencesSchema> {}
export interface RecordDeleted extends v.InferInput<typeof recordDeletedSchema> {}
export interface SubjectActivitySubscription extends v.InferInput<typeof subjectActivitySubscriptionSchema> {}
