import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _reasonTypeSchema = /*#__PURE__*/ v.string();
export const reasonTypeSchema = _reasonTypeSchema as reasonTypeSchema.$schema;
export type ReasonType = v.InferInput<typeof reasonTypeSchema>;
export declare namespace reasonTypeSchema {
	export {};
	type $schematype = typeof _reasonTypeSchema;
	export interface $schema extends $schematype {}
}

const _reasonSpamSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonSpam');
export const reasonSpamSchema = _reasonSpamSchema as reasonSpamSchema.$schema;
export type ReasonSpam = v.InferInput<typeof reasonSpamSchema>;
export declare namespace reasonSpamSchema {
	export {};
	type $schematype = typeof _reasonSpamSchema;
	export interface $schema extends $schematype {}
}

const _reasonViolationSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonViolation');
export const reasonViolationSchema = _reasonViolationSchema as reasonViolationSchema.$schema;
export type ReasonViolation = v.InferInput<typeof reasonViolationSchema>;
export declare namespace reasonViolationSchema {
	export {};
	type $schematype = typeof _reasonViolationSchema;
	export interface $schema extends $schematype {}
}

const _reasonMisleadingSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonMisleading');
export const reasonMisleadingSchema = _reasonMisleadingSchema as reasonMisleadingSchema.$schema;
export type ReasonMisleading = v.InferInput<typeof reasonMisleadingSchema>;
export declare namespace reasonMisleadingSchema {
	export {};
	type $schematype = typeof _reasonMisleadingSchema;
	export interface $schema extends $schematype {}
}

const _reasonSexualSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonSexual');
export const reasonSexualSchema = _reasonSexualSchema as reasonSexualSchema.$schema;
export type ReasonSexual = v.InferInput<typeof reasonSexualSchema>;
export declare namespace reasonSexualSchema {
	export {};
	type $schematype = typeof _reasonSexualSchema;
	export interface $schema extends $schematype {}
}

const _reasonRudeSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonRude');
export const reasonRudeSchema = _reasonRudeSchema as reasonRudeSchema.$schema;
export type ReasonRude = v.InferInput<typeof reasonRudeSchema>;
export declare namespace reasonRudeSchema {
	export {};
	type $schematype = typeof _reasonRudeSchema;
	export interface $schema extends $schematype {}
}

const _reasonOtherSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonOther');
export const reasonOtherSchema = _reasonOtherSchema as reasonOtherSchema.$schema;
export type ReasonOther = v.InferInput<typeof reasonOtherSchema>;
export declare namespace reasonOtherSchema {
	export {};
	type $schematype = typeof _reasonOtherSchema;
	export interface $schema extends $schematype {}
}

const _reasonAppealSchema = /*#__PURE__*/ v.literal('com.atproto.moderation.defs#reasonAppeal');
export const reasonAppealSchema = _reasonAppealSchema as reasonAppealSchema.$schema;
export type ReasonAppeal = v.InferInput<typeof reasonAppealSchema>;
export declare namespace reasonAppealSchema {
	export {};
	type $schematype = typeof _reasonAppealSchema;
	export interface $schema extends $schematype {}
}

const _subjectTypeSchema = /*#__PURE__*/ v.string();
export const subjectTypeSchema = _subjectTypeSchema as subjectTypeSchema.$schema;
export type SubjectType = v.InferInput<typeof subjectTypeSchema>;
export declare namespace subjectTypeSchema {
	export {};
	type $schematype = typeof _subjectTypeSchema;
	export interface $schema extends $schematype {}
}
