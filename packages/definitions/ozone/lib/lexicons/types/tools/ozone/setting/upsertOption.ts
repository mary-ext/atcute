import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneSettingDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.setting.upsertOption', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			description: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 2000)]),
			),
			key: /*#__PURE__*/ v.nsidString(),
			managerRole: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<
					| 'tools.ozone.team.defs#roleAdmin'
					| 'tools.ozone.team.defs#roleModerator'
					| 'tools.ozone.team.defs#roleTriage'
					| 'tools.ozone.team.defs#roleVerifier'
					| (string & {})
				>(),
			),
			scope: /*#__PURE__*/ v.string<'instance' | 'personal' | (string & {})>(),
			value: /*#__PURE__*/ v.unknown(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get option() {
				return ToolsOzoneSettingDefs.optionSchema;
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.setting.upsertOption': mainSchema;
	}
}
