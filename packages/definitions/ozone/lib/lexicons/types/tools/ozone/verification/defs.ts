import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as ToolsOzoneModerationDefs from '../moderation/defs.js';

const _verificationViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.verification.defs#verificationView')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	displayName: /*#__PURE__*/ v.string(),
	handle: /*#__PURE__*/ v.handleString(),
	issuer: /*#__PURE__*/ v.didString(),
	get issuerProfile() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([]));
	},
	get issuerRepo() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([
				ToolsOzoneModerationDefs.repoViewDetailSchema,
				ToolsOzoneModerationDefs.repoViewNotFoundSchema,
			]),
		);
	},
	revokeReason: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	revokedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	revokedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	subject: /*#__PURE__*/ v.didString(),
	get subjectProfile() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([]));
	},
	get subjectRepo() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([
				ToolsOzoneModerationDefs.repoViewDetailSchema,
				ToolsOzoneModerationDefs.repoViewNotFoundSchema,
			]),
		);
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type verificationView$schematype = typeof _verificationViewSchema;

export interface verificationViewSchema extends verificationView$schematype {}

export const verificationViewSchema = _verificationViewSchema as verificationViewSchema;

export interface VerificationView extends v.InferInput<typeof verificationViewSchema> {}
