import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _inviteCodeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.defs#inviteCode')),
	available: /*#__PURE__*/ v.integer(),
	code: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	createdBy: /*#__PURE__*/ v.string(),
	disabled: /*#__PURE__*/ v.boolean(),
	forAccount: /*#__PURE__*/ v.string(),
	get uses() {
		return /*#__PURE__*/ v.array(inviteCodeUseSchema);
	},
});
const _inviteCodeUseSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.defs#inviteCodeUse')),
	usedAt: /*#__PURE__*/ v.datetimeString(),
	usedBy: /*#__PURE__*/ v.didString(),
});

type inviteCode$schematype = typeof _inviteCodeSchema;
type inviteCodeUse$schematype = typeof _inviteCodeUseSchema;

export interface inviteCodeSchema extends inviteCode$schematype {}
export interface inviteCodeUseSchema extends inviteCodeUse$schematype {}

export const inviteCodeSchema = _inviteCodeSchema as inviteCodeSchema;
export const inviteCodeUseSchema = _inviteCodeUseSchema as inviteCodeUseSchema;

export interface InviteCode extends v.InferInput<typeof inviteCodeSchema> {}
export interface InviteCodeUse extends v.InferInput<typeof inviteCodeUseSchema> {}
