import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _reasonAppealSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonAppeal');
const _reasonMisleadingSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonMisleading');
const _reasonOtherSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonOther');
const _reasonRudeSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonRude');
const _reasonSexualSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonSexual');
const _reasonSpamSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonSpam');
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
const _reasonViolationSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonViolation');
const _subjectTypeSchema = /*#__PURE__*/ v.string<'account' | 'record' | 'chat' | (string & {})>();

type reasonAppeal$schematype = typeof _reasonAppealSchema;
type reasonMisleading$schematype = typeof _reasonMisleadingSchema;
type reasonOther$schematype = typeof _reasonOtherSchema;
type reasonRude$schematype = typeof _reasonRudeSchema;
type reasonSexual$schematype = typeof _reasonSexualSchema;
type reasonSpam$schematype = typeof _reasonSpamSchema;
type reasonType$schematype = typeof _reasonTypeSchema;
type reasonViolation$schematype = typeof _reasonViolationSchema;
type subjectType$schematype = typeof _subjectTypeSchema;

export interface reasonAppealSchema extends reasonAppeal$schematype {}
export interface reasonMisleadingSchema extends reasonMisleading$schematype {}
export interface reasonOtherSchema extends reasonOther$schematype {}
export interface reasonRudeSchema extends reasonRude$schematype {}
export interface reasonSexualSchema extends reasonSexual$schematype {}
export interface reasonSpamSchema extends reasonSpam$schematype {}
export interface reasonTypeSchema extends reasonType$schematype {}
export interface reasonViolationSchema extends reasonViolation$schematype {}
export interface subjectTypeSchema extends subjectType$schematype {}

export const reasonAppealSchema = _reasonAppealSchema as reasonAppealSchema;
export const reasonMisleadingSchema = _reasonMisleadingSchema as reasonMisleadingSchema;
export const reasonOtherSchema = _reasonOtherSchema as reasonOtherSchema;
export const reasonRudeSchema = _reasonRudeSchema as reasonRudeSchema;
export const reasonSexualSchema = _reasonSexualSchema as reasonSexualSchema;
export const reasonSpamSchema = _reasonSpamSchema as reasonSpamSchema;
export const reasonTypeSchema = _reasonTypeSchema as reasonTypeSchema;
export const reasonViolationSchema = _reasonViolationSchema as reasonViolationSchema;
export const subjectTypeSchema = _subjectTypeSchema as subjectTypeSchema;

export type ReasonAppeal = v.InferInput<typeof reasonAppealSchema>;
export type ReasonMisleading = v.InferInput<typeof reasonMisleadingSchema>;
export type ReasonOther = v.InferInput<typeof reasonOtherSchema>;
export type ReasonRude = v.InferInput<typeof reasonRudeSchema>;
export type ReasonSexual = v.InferInput<typeof reasonSexualSchema>;
export type ReasonSpam = v.InferInput<typeof reasonSpamSchema>;
export type ReasonType = v.InferInput<typeof reasonTypeSchema>;
export type ReasonViolation = v.InferInput<typeof reasonViolationSchema>;
export type SubjectType = v.InferInput<typeof subjectTypeSchema>;
