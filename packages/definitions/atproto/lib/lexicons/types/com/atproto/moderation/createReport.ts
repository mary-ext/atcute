import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoAdminDefs from '../admin/defs.js';
import * as ComAtprotoModerationDefs from './defs.js';
import * as ComAtprotoRepoStrongRef from '../repo/strongRef.js';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.moderation.createReport', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get modTool() {
				return /*#__PURE__*/ v.optional(modToolSchema);
			},
			reason: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
					/*#__PURE__*/ v.stringLength(0, 20000),
					/*#__PURE__*/ v.stringGraphemes(0, 2000),
				]),
			),
			get reasonType() {
				return ComAtprotoModerationDefs.reasonTypeSchema;
			},
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
		schema: /*#__PURE__*/ v.object({
			createdAt: /*#__PURE__*/ v.datetimeString(),
			id: /*#__PURE__*/ v.integer(),
			reason: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
					/*#__PURE__*/ v.stringLength(0, 20000),
					/*#__PURE__*/ v.stringGraphemes(0, 2000),
				]),
			),
			get reasonType() {
				return ComAtprotoModerationDefs.reasonTypeSchema;
			},
			reportedBy: /*#__PURE__*/ v.didString(),
			get subject() {
				return /*#__PURE__*/ v.variant([
					ComAtprotoAdminDefs.repoRefSchema,
					ComAtprotoRepoStrongRef.mainSchema,
				]);
			},
		}),
	},
});
const _modToolSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.moderation.createReport#modTool')),
	meta: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
	name: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;
type modTool$schematype = typeof _modToolSchema;

export interface mainSchema extends main$schematype {}
export interface modToolSchema extends modTool$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const modToolSchema = _modToolSchema as modToolSchema;

export interface ModTool extends v.InferInput<typeof modToolSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.moderation.createReport': mainSchema;
	}
}
