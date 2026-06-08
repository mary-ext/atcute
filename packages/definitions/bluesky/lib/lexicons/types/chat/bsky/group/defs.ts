import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyActorDefs from '../actor/defs.ts';
import * as ChatBskyConvoDefs from '../convo/defs.ts';

const _disabledJoinLinkPreviewViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.group.defs#disabledJoinLinkPreviewView'),
	),
	code: /*#__PURE__*/ v.string(),
});
const _invalidJoinLinkPreviewViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.group.defs#invalidJoinLinkPreviewView')),
	code: /*#__PURE__*/ v.string(),
});
const _joinLinkPreviewViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.group.defs#joinLinkPreviewView')),
	code: /*#__PURE__*/ v.string(),
	/** Present only if the request is authenticated and the user is a member of the group. */
	get convo() {
		return /*#__PURE__*/ v.optional(ChatBskyConvoDefs.convoViewSchema);
	},
	convoId: /*#__PURE__*/ v.string(),
	get joinRule() {
		return joinRuleSchema;
	},
	memberCount: /*#__PURE__*/ v.integer(),
	memberLimit: /*#__PURE__*/ v.integer(),
	name: /*#__PURE__*/ v.string(),
	get owner() {
		return ChatBskyActorDefs.profileViewBasicSchema;
	},
	requireApproval: /*#__PURE__*/ v.boolean(),
	get viewer() {
		return /*#__PURE__*/ v.optional(joinLinkViewerStateSchema);
	},
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
const _joinLinkViewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.group.defs#joinLinkViewerState')),
	requestedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _joinRequestConvoViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.group.defs#joinRequestConvoView')),
	convoId: /*#__PURE__*/ v.string(),
	memberCount: /*#__PURE__*/ v.integer(),
	memberLimit: /*#__PURE__*/ v.integer(),
	name: /*#__PURE__*/ v.string(),
	get owner() {
		return ChatBskyActorDefs.profileViewBasicSchema;
	},
	get viewer() {
		return joinLinkViewerStateSchema;
	},
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

type disabledJoinLinkPreviewView$schematype = typeof _disabledJoinLinkPreviewViewSchema;
type invalidJoinLinkPreviewView$schematype = typeof _invalidJoinLinkPreviewViewSchema;
type joinLinkPreviewView$schematype = typeof _joinLinkPreviewViewSchema;
type joinLinkView$schematype = typeof _joinLinkViewSchema;
type joinLinkViewerState$schematype = typeof _joinLinkViewerStateSchema;
type joinRequestConvoView$schematype = typeof _joinRequestConvoViewSchema;
type joinRequestView$schematype = typeof _joinRequestViewSchema;
type joinRule$schematype = typeof _joinRuleSchema;
type linkEnabledStatus$schematype = typeof _linkEnabledStatusSchema;

export interface disabledJoinLinkPreviewViewSchema extends disabledJoinLinkPreviewView$schematype {}
export interface invalidJoinLinkPreviewViewSchema extends invalidJoinLinkPreviewView$schematype {}
export interface joinLinkPreviewViewSchema extends joinLinkPreviewView$schematype {}
export interface joinLinkViewSchema extends joinLinkView$schematype {}
export interface joinLinkViewerStateSchema extends joinLinkViewerState$schematype {}
export interface joinRequestConvoViewSchema extends joinRequestConvoView$schematype {}
export interface joinRequestViewSchema extends joinRequestView$schematype {}
export interface joinRuleSchema extends joinRule$schematype {}
export interface linkEnabledStatusSchema extends linkEnabledStatus$schematype {}

export const disabledJoinLinkPreviewViewSchema =
	_disabledJoinLinkPreviewViewSchema as disabledJoinLinkPreviewViewSchema;
export const invalidJoinLinkPreviewViewSchema =
	_invalidJoinLinkPreviewViewSchema as invalidJoinLinkPreviewViewSchema;
export const joinLinkPreviewViewSchema = _joinLinkPreviewViewSchema as joinLinkPreviewViewSchema;
export const joinLinkViewSchema = _joinLinkViewSchema as joinLinkViewSchema;
export const joinLinkViewerStateSchema = _joinLinkViewerStateSchema as joinLinkViewerStateSchema;
export const joinRequestConvoViewSchema = _joinRequestConvoViewSchema as joinRequestConvoViewSchema;
export const joinRequestViewSchema = _joinRequestViewSchema as joinRequestViewSchema;
export const joinRuleSchema = _joinRuleSchema as joinRuleSchema;
export const linkEnabledStatusSchema = _linkEnabledStatusSchema as linkEnabledStatusSchema;

export interface DisabledJoinLinkPreviewView extends v.InferInput<typeof disabledJoinLinkPreviewViewSchema> {}
export interface InvalidJoinLinkPreviewView extends v.InferInput<typeof invalidJoinLinkPreviewViewSchema> {}
export interface JoinLinkPreviewView extends v.InferInput<typeof joinLinkPreviewViewSchema> {}
export interface JoinLinkView extends v.InferInput<typeof joinLinkViewSchema> {}
export interface JoinLinkViewerState extends v.InferInput<typeof joinLinkViewerStateSchema> {}
export interface JoinRequestConvoView extends v.InferInput<typeof joinRequestConvoViewSchema> {}
export interface JoinRequestView extends v.InferInput<typeof joinRequestViewSchema> {}
export type JoinRule = v.InferInput<typeof joinRuleSchema>;
export type LinkEnabledStatus = v.InferInput<typeof linkEnabledStatusSchema>;
