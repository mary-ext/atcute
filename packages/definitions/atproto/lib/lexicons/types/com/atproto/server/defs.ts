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
const _inviteCodeUseSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.defs#inviteCodeUse')),
	usedBy: /*#__PURE__*/ v.didString(),
	usedAt: /*#__PURE__*/ v.datetimeString(),
});

type inviteCode$schematype = typeof _inviteCodeSchema;
type inviteCodeUse$schematype = typeof _inviteCodeUseSchema;

/** @deprecated */
export interface inviteCode$schema extends inviteCode$schematype {}
/** @deprecated */
export interface inviteCodeUse$schema extends inviteCodeUse$schematype {}

export const inviteCodeSchema = _inviteCodeSchema as inviteCode$schema;
export const inviteCodeUseSchema = _inviteCodeUseSchema as inviteCodeUse$schema;

export interface InviteCode extends v.InferInput<typeof inviteCodeSchema> {}
export interface InviteCodeUse extends v.InferInput<typeof inviteCodeUseSchema> {}
