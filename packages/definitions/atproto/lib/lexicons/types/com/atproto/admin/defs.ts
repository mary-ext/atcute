import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as ComAtprotoServerDefs from '../server/defs.js';

const _statusAttrSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#statusAttr')),
	applied: /*#__PURE__*/ v.boolean(),
	ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
export const statusAttrSchema = _statusAttrSchema as statusAttrSchema.$schema;
export interface StatusAttr extends v.InferInput<typeof statusAttrSchema> {}
export declare namespace statusAttrSchema {
	export {};
	type $schematype = typeof _statusAttrSchema;
	export interface $schema extends $schematype {}
}

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
export const accountViewSchema = _accountViewSchema as accountViewSchema.$schema;
export interface AccountView extends v.InferInput<typeof accountViewSchema> {}
export declare namespace accountViewSchema {
	export {};
	type $schematype = typeof _accountViewSchema;
	export interface $schema extends $schematype {}
}

const _repoRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#repoRef')),
	did: /*#__PURE__*/ v.didString(),
});
export const repoRefSchema = _repoRefSchema as repoRefSchema.$schema;
export interface RepoRef extends v.InferInput<typeof repoRefSchema> {}
export declare namespace repoRefSchema {
	export {};
	type $schematype = typeof _repoRefSchema;
	export interface $schema extends $schematype {}
}

const _repoBlobRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#repoBlobRef')),
	did: /*#__PURE__*/ v.didString(),
	cid: /*#__PURE__*/ v.string(),
	recordUri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
export const repoBlobRefSchema = _repoBlobRefSchema as repoBlobRefSchema.$schema;
export interface RepoBlobRef extends v.InferInput<typeof repoBlobRefSchema> {}
export declare namespace repoBlobRefSchema {
	export {};
	type $schematype = typeof _repoBlobRefSchema;
	export interface $schema extends $schematype {}
}

const _threatSignatureSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.admin.defs#threatSignature')),
	property: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});
export const threatSignatureSchema = _threatSignatureSchema as threatSignatureSchema.$schema;
export interface ThreatSignature extends v.InferInput<typeof threatSignatureSchema> {}
export declare namespace threatSignatureSchema {
	export {};
	type $schematype = typeof _threatSignatureSchema;
	export interface $schema extends $schematype {}
}
