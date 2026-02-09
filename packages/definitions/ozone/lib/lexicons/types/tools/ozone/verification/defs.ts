import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneModerationDefs from '../moderation/defs.ts';

const _verificationViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.verification.defs#verificationView')),
	/**
	 * Timestamp when the verification was created.
	 */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/**
	 * Display name of the subject the verification applies to at the moment of verifying, which might not be the same at the time of viewing. The verification is only valid if the current displayName matches the one at the time of verifying.
	 */
	displayName: /*#__PURE__*/ v.string(),
	/**
	 * Handle of the subject the verification applies to at the moment of verifying, which might not be the same at the time of viewing. The verification is only valid if the current handle matches the one at the time of verifying.
	 */
	handle: /*#__PURE__*/ v.handleString(),
	/**
	 * The user who issued this verification.
	 */
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
	/**
	 * Describes the reason for revocation, also indicating that the verification is no longer valid.
	 */
	revokeReason: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Timestamp when the verification was revoked.
	 */
	revokedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * The user who revoked this verification.
	 */
	revokedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	/**
	 * The subject of the verification.
	 */
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
	/**
	 * The AT-URI of the verification record.
	 */
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type verificationView$schematype = typeof _verificationViewSchema;

export interface verificationViewSchema extends verificationView$schematype {}

export const verificationViewSchema = _verificationViewSchema as verificationViewSchema;

export interface VerificationView extends v.InferInput<typeof verificationViewSchema> {}
