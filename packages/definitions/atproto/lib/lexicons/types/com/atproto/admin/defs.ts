import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as ComAtprotoServerDefs from '../server/defs.js';

const _accountViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#accountView')),
	deactivatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	did: /*#__PURE__*/ v.didString(),
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	emailConfirmedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	handle: /*#__PURE__*/ v.handleString(),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	inviteNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get invitedBy() {
		return /*#__PURE__*/ v.optional(ComAtprotoServerDefs.inviteCodeSchema);
	},
	get invites() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoServerDefs.inviteCodeSchema));
	},
	invitesDisabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	relatedRecords: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.unknown())),
	get threatSignatures() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(threatSignatureSchema));
	},
});
const _repoBlobRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#repoBlobRef')),
	cid: /*#__PURE__*/ v.cidString(),
	did: /*#__PURE__*/ v.didString(),
	recordUri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
const _repoRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#repoRef')),
	did: /*#__PURE__*/ v.didString(),
});
const _statusAttrSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#statusAttr')),
	applied: /*#__PURE__*/ v.boolean(),
	ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _threatSignatureSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#threatSignature')),
	property: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});

type accountView$schematype = typeof _accountViewSchema;
type repoBlobRef$schematype = typeof _repoBlobRefSchema;
type repoRef$schematype = typeof _repoRefSchema;
type statusAttr$schematype = typeof _statusAttrSchema;
type threatSignature$schematype = typeof _threatSignatureSchema;

export interface accountViewSchema extends accountView$schematype {}
export interface repoBlobRefSchema extends repoBlobRef$schematype {}
export interface repoRefSchema extends repoRef$schematype {}
export interface statusAttrSchema extends statusAttr$schematype {}
export interface threatSignatureSchema extends threatSignature$schematype {}

export const accountViewSchema = _accountViewSchema as accountViewSchema;
export const repoBlobRefSchema = _repoBlobRefSchema as repoBlobRefSchema;
export const repoRefSchema = _repoRefSchema as repoRefSchema;
export const statusAttrSchema = _statusAttrSchema as statusAttrSchema;
export const threatSignatureSchema = _threatSignatureSchema as threatSignatureSchema;

export interface AccountView extends v.InferInput<typeof accountViewSchema> {}
export interface RepoBlobRef extends v.InferInput<typeof repoBlobRefSchema> {}
export interface RepoRef extends v.InferInput<typeof repoRefSchema> {}
export interface StatusAttr extends v.InferInput<typeof statusAttrSchema> {}
export interface ThreatSignature extends v.InferInput<typeof threatSignatureSchema> {}
