import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as ComAtprotoServerDefs from '../server/defs.js';

const _statusAttrSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#statusAttr')),
	applied: /*#__PURE__*/ v.boolean(),
	ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _accountViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#accountView')),
	did: /*#__PURE__*/ v.didString(),
	handle: /*#__PURE__*/ v.handleString(),
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	relatedRecords: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.unknown())),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get invitedBy() {
		return /*#__PURE__*/ v.optional(ComAtprotoServerDefs.inviteCodeSchema);
	},
	get invites() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoServerDefs.inviteCodeSchema));
	},
	invitesDisabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	emailConfirmedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	inviteNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	deactivatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get threatSignatures() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(threatSignatureSchema));
	},
});
const _repoRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#repoRef')),
	did: /*#__PURE__*/ v.didString(),
});
const _repoBlobRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#repoBlobRef')),
	did: /*#__PURE__*/ v.didString(),
	cid: /*#__PURE__*/ v.string(),
	recordUri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
const _threatSignatureSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#threatSignature')),
	property: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});

type statusAttr$schematype = typeof _statusAttrSchema;
type accountView$schematype = typeof _accountViewSchema;
type repoRef$schematype = typeof _repoRefSchema;
type repoBlobRef$schematype = typeof _repoBlobRefSchema;
type threatSignature$schematype = typeof _threatSignatureSchema;

/** @deprecated */
export interface statusAttr$schema extends statusAttr$schematype {}
/** @deprecated */
export interface accountView$schema extends accountView$schematype {}
/** @deprecated */
export interface repoRef$schema extends repoRef$schematype {}
/** @deprecated */
export interface repoBlobRef$schema extends repoBlobRef$schematype {}
/** @deprecated */
export interface threatSignature$schema extends threatSignature$schematype {}

export const statusAttrSchema = _statusAttrSchema as statusAttr$schema;
export const accountViewSchema = _accountViewSchema as accountView$schema;
export const repoRefSchema = _repoRefSchema as repoRef$schema;
export const repoBlobRefSchema = _repoBlobRefSchema as repoBlobRef$schema;
export const threatSignatureSchema = _threatSignatureSchema as threatSignature$schema;

export interface StatusAttr extends v.InferInput<typeof statusAttrSchema> {}
export interface AccountView extends v.InferInput<typeof accountViewSchema> {}
export interface RepoRef extends v.InferInput<typeof repoRefSchema> {}
export interface RepoBlobRef extends v.InferInput<typeof repoBlobRefSchema> {}
export interface ThreatSignature extends v.InferInput<typeof threatSignatureSchema> {}
