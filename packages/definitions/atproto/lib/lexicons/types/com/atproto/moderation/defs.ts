import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _reasonTypeSchema = /*#__PURE__*/ v.string<
	| 'com.atproto.moderation.defs#reasonSpam'
	| 'com.atproto.moderation.defs#reasonViolation'
	| 'com.atproto.moderation.defs#reasonMisleading'
	| 'com.atproto.moderation.defs#reasonSexual'
	| 'com.atproto.moderation.defs#reasonRude'
	| 'com.atproto.moderation.defs#reasonOther'
	| 'com.atproto.moderation.defs#reasonAppeal'
	| (string & {})
>();
const _reasonSpamSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonSpam');
const _reasonViolationSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonViolation');
const _reasonMisleadingSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonMisleading');
const _reasonSexualSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonSexual');
const _reasonRudeSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonRude');
const _reasonOtherSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonOther');
const _reasonAppealSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonAppeal');
const _subjectTypeSchema = /*#__PURE__*/ v.string<'account' | 'record' | 'chat' | (string & {})>();

type reasonType$schematype = typeof _reasonTypeSchema;
type reasonSpam$schematype = typeof _reasonSpamSchema;
type reasonViolation$schematype = typeof _reasonViolationSchema;
type reasonMisleading$schematype = typeof _reasonMisleadingSchema;
type reasonSexual$schematype = typeof _reasonSexualSchema;
type reasonRude$schematype = typeof _reasonRudeSchema;
type reasonOther$schematype = typeof _reasonOtherSchema;
type reasonAppeal$schematype = typeof _reasonAppealSchema;
type subjectType$schematype = typeof _subjectTypeSchema;

/** @deprecated */
export interface reasonType$schema extends reasonType$schematype {}
/** @deprecated */
export interface reasonSpam$schema extends reasonSpam$schematype {}
/** @deprecated */
export interface reasonViolation$schema extends reasonViolation$schematype {}
/** @deprecated */
export interface reasonMisleading$schema extends reasonMisleading$schematype {}
/** @deprecated */
export interface reasonSexual$schema extends reasonSexual$schematype {}
/** @deprecated */
export interface reasonRude$schema extends reasonRude$schematype {}
/** @deprecated */
export interface reasonOther$schema extends reasonOther$schematype {}
/** @deprecated */
export interface reasonAppeal$schema extends reasonAppeal$schematype {}
/** @deprecated */
export interface subjectType$schema extends subjectType$schematype {}

export const reasonTypeSchema = _reasonTypeSchema as reasonType$schema;
export const reasonSpamSchema = _reasonSpamSchema as reasonSpam$schema;
export const reasonViolationSchema = _reasonViolationSchema as reasonViolation$schema;
export const reasonMisleadingSchema = _reasonMisleadingSchema as reasonMisleading$schema;
export const reasonSexualSchema = _reasonSexualSchema as reasonSexual$schema;
export const reasonRudeSchema = _reasonRudeSchema as reasonRude$schema;
export const reasonOtherSchema = _reasonOtherSchema as reasonOther$schema;
export const reasonAppealSchema = _reasonAppealSchema as reasonAppeal$schema;
export const subjectTypeSchema = _subjectTypeSchema as subjectType$schema;

export type ReasonType = v.InferInput<typeof reasonTypeSchema>;
export type ReasonSpam = v.InferInput<typeof reasonSpamSchema>;
export type ReasonViolation = v.InferInput<typeof reasonViolationSchema>;
export type ReasonMisleading = v.InferInput<typeof reasonMisleadingSchema>;
export type ReasonSexual = v.InferInput<typeof reasonSexualSchema>;
export type ReasonRude = v.InferInput<typeof reasonRudeSchema>;
export type ReasonOther = v.InferInput<typeof reasonOtherSchema>;
export type ReasonAppeal = v.InferInput<typeof reasonAppealSchema>;
export type SubjectType = v.InferInput<typeof subjectTypeSchema>;
