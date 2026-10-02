import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ComAtprotoModerationCreateReport from '@atcute/atproto/types/moderation/createReport';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneInboxDefs from './defs.ts';

const _actionRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.inbox.appealActionedSubject#actionRef'),
	),
	/**
	 * ID of the moderation action being appealed, available via actions in mod inbox.
	 *
	 * @minimum 1
	 */
	id: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});
const _labelRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.inbox.appealActionedSubject#labelRef'),
	),
	/**
	 * Label being appealed.
	 *
	 * @minLength 1
	 */
	val: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1)]),
});
const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.inbox.appealActionedSubject', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Moderation action being appealed. */
			get action() {
				return /*#__PURE__*/ v.optional(
					/*#__PURE__*/ v.variant([actionRefSchema, labelRefSchema, takedownRefSchema], true),
				);
			},
			get modTool() {
				return /*#__PURE__*/ v.optional(ComAtprotoModerationCreateReport.modToolSchema);
			},
			/**
			 * Optional explanation supplied by the user.
			 *
			 * @maxLength 20000
			 * @maxGraphemes 2000
			 */
			reason: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
					/*#__PURE__*/ v.stringLength(0, 20000),
					/*#__PURE__*/ v.stringGraphemes(0, 2000),
				]),
			),
			/** Subject being appealed. */
			get subject() {
				return /*#__PURE__*/ v.variant([
					ComAtprotoAdminDefs.repoRefSchema,
					ComAtprotoRepoStrongRef.mainSchema,
				]);
			},
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneInboxDefs.subjectViewSchema;
		},
	},
});
const _takedownRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.inbox.appealActionedSubject#takedownRef'),
	),
});

type actionRef$schematype = typeof _actionRefSchema;
type labelRef$schematype = typeof _labelRefSchema;
type main$schematype = typeof _mainSchema;
type takedownRef$schematype = typeof _takedownRefSchema;

export interface actionRefSchema extends actionRef$schematype {}
export interface labelRefSchema extends labelRef$schematype {}
export interface mainSchema extends main$schematype {}
export interface takedownRefSchema extends takedownRef$schematype {}

export const actionRefSchema = _actionRefSchema as actionRefSchema;
export const labelRefSchema = _labelRefSchema as labelRefSchema;
export const mainSchema = _mainSchema as mainSchema;
export const takedownRefSchema = _takedownRefSchema as takedownRefSchema;

export interface ActionRef extends v.InferInput<typeof actionRefSchema> {}
export interface LabelRef extends v.InferInput<typeof labelRefSchema> {}
export interface TakedownRef extends v.InferInput<typeof takedownRefSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.inbox.appealActionedSubject': mainSchema;
	}
}
