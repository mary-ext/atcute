import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.setting.removeOptions', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			keys: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()), [
				/*#__PURE__*/ v.arrayLength(1, 200),
			]),
			scope: /*#__PURE__*/ v.string<'instance' | 'personal' | (string & {})>(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.setting.removeOptions': mainSchema;
	}
}
