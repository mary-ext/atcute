import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.set.deleteValues', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			name: /*#__PURE__*/ v.string(),
			values: /*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.string()), [/*#__PURE__*/ v.arrayLength(1)]),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.set.deleteValues': mainSchema;
	}
}
