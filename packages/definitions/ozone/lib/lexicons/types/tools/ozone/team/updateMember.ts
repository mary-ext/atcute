import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneTeamDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.team.updateMember', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			did: /*#__PURE__*/ v.didString(),
			disabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			role: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<
					| 'tools.ozone.team.defs#roleAdmin'
					| 'tools.ozone.team.defs#roleModerator'
					| 'tools.ozone.team.defs#roleTriage'
					| 'tools.ozone.team.defs#roleVerifier'
					| (string & {})
				>(),
			),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneTeamDefs.memberSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.team.updateMember': mainSchema;
	}
}
