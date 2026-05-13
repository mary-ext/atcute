import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyActorDefs from '../actor/defs.ts';
import * as ChatBskyConvoDefs from '../convo/defs.ts';

const _joinLinkPreviewViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.group.defs#joinLinkPreviewView')),
	/** Present only if the request is authenticated and the user is a member of the group. */
	get convo() {
		return /*#__PURE__*/ v.optional(ChatBskyConvoDefs.convoViewSchema);
	},
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

type joinLinkPreviewView$schematype = typeof _joinLinkPreviewViewSchema;
type joinLinkView$schematype = typeof _joinLinkViewSchema;
type joinRequestView$schematype = typeof _joinRequestViewSchema;
type joinRule$schematype = typeof _joinRuleSchema;
type linkEnabledStatus$schematype = typeof _linkEnabledStatusSchema;

export interface joinLinkPreviewViewSchema extends joinLinkPreviewView$schematype {}
export interface joinLinkViewSchema extends joinLinkView$schematype {}
export interface joinRequestViewSchema extends joinRequestView$schematype {}
export interface joinRuleSchema extends joinRule$schematype {}
export interface linkEnabledStatusSchema extends linkEnabledStatus$schematype {}

export const joinLinkPreviewViewSchema = _joinLinkPreviewViewSchema as joinLinkPreviewViewSchema;
export const joinLinkViewSchema = _joinLinkViewSchema as joinLinkViewSchema;
export const joinRequestViewSchema = _joinRequestViewSchema as joinRequestViewSchema;
export const joinRuleSchema = _joinRuleSchema as joinRuleSchema;
export const linkEnabledStatusSchema = _linkEnabledStatusSchema as linkEnabledStatusSchema;

export interface JoinLinkPreviewView extends v.InferInput<typeof joinLinkPreviewViewSchema> {}
export interface JoinLinkView extends v.InferInput<typeof joinLinkViewSchema> {}
export interface JoinRequestView extends v.InferInput<typeof joinRequestViewSchema> {}
export type JoinRule = v.InferInput<typeof joinRuleSchema>;
export type LinkEnabledStatus = v.InferInput<typeof linkEnabledStatusSchema>;
