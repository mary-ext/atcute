import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _inviteCodeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.defs#inviteCode')),
	code: /*#__PURE__*/ v.string(),
	available: /*#__PURE__*/ v.integer(),
	disabled: /*#__PURE__*/ v.boolean(),
	forAccount: /*#__PURE__*/ v.string(),
	createdBy: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get uses() {
		return /*#__PURE__*/ v.array(inviteCodeUseSchema);
	},
});
export const inviteCodeSchema = _inviteCodeSchema as inviteCodeSchema.$schema;
export interface InviteCode extends v.InferInput<typeof inviteCodeSchema> {}
export declare namespace inviteCodeSchema {
	export {};
	type $schematype = typeof _inviteCodeSchema;
	export interface $schema extends $schematype {}
}

const _inviteCodeUseSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.defs#inviteCodeUse')),
	usedBy: /*#__PURE__*/ v.didString(),
	usedAt: /*#__PURE__*/ v.datetimeString(),
});
export const inviteCodeUseSchema = _inviteCodeUseSchema as inviteCodeUseSchema.$schema;
export interface InviteCodeUse extends v.InferInput<typeof inviteCodeUseSchema> {}
export declare namespace inviteCodeUseSchema {
	export {};
	type $schematype = typeof _inviteCodeUseSchema;
	export interface $schema extends $schematype {}
}
