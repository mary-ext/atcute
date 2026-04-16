import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyActorDefs from '../actor/defs.ts';

const _groupPublicViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.group.defs#groupPublicView')),
	memberCount: /*#__PURE__*/ v.integer(),
	name: /*#__PURE__*/ v.string(),
	get owner() {
		return ChatBskyActorDefs.profileViewBasicSchema;
	},
	requireApproval: /*#__PURE__*/ v.boolean(),
});
const _joinLinkViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.group.defs#joinLinkView')),
	code: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get enabledStatus() {
		return linkEnabledStatusSchema;
	},
	get joinRule() {
		return joinRuleSchema;
	},
	requireApproval: /*#__PURE__*/ v.boolean(),
});
const _joinRequestViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.group.defs#joinRequestView')),
	convoId: /*#__PURE__*/ v.string(),
	requestedAt: /*#__PURE__*/ v.datetimeString(),
	get requestedBy() {
		return ChatBskyActorDefs.profileViewBasicSchema;
	},
});
const _joinRuleSchema = /*#__PURE__*/ v.string<'anyone' | 'followedByOwner' | (string & {})>();
const _linkEnabledStatusSchema = /*#__PURE__*/ v.string<'disabled' | 'enabled' | (string & {})>();

type groupPublicView$schematype = typeof _groupPublicViewSchema;
type joinLinkView$schematype = typeof _joinLinkViewSchema;
type joinRequestView$schematype = typeof _joinRequestViewSchema;
type joinRule$schematype = typeof _joinRuleSchema;
type linkEnabledStatus$schematype = typeof _linkEnabledStatusSchema;

export interface groupPublicViewSchema extends groupPublicView$schematype {}
export interface joinLinkViewSchema extends joinLinkView$schematype {}
export interface joinRequestViewSchema extends joinRequestView$schematype {}
export interface joinRuleSchema extends joinRule$schematype {}
export interface linkEnabledStatusSchema extends linkEnabledStatus$schematype {}

export const groupPublicViewSchema = _groupPublicViewSchema as groupPublicViewSchema;
export const joinLinkViewSchema = _joinLinkViewSchema as joinLinkViewSchema;
export const joinRequestViewSchema = _joinRequestViewSchema as joinRequestViewSchema;
export const joinRuleSchema = _joinRuleSchema as joinRuleSchema;
export const linkEnabledStatusSchema = _linkEnabledStatusSchema as linkEnabledStatusSchema;

export interface GroupPublicView extends v.InferInput<typeof groupPublicViewSchema> {}
export interface JoinLinkView extends v.InferInput<typeof joinLinkViewSchema> {}
export interface JoinRequestView extends v.InferInput<typeof joinRequestViewSchema> {}
export type JoinRule = v.InferInput<typeof joinRuleSchema>;
export type LinkEnabledStatus = v.InferInput<typeof linkEnabledStatusSchema>;
