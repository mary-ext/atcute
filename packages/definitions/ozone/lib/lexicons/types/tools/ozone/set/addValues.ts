import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.set.addValues', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Name of the set to add values to
			 */
			name: /*#__PURE__*/ v.string(),
			/**
			 * Array of string values to add to the set
			 * @minLength 1
			 * @maxLength 1000
			 */
			values: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
				/*#__PURE__*/ v.arrayLength(1, 1000),
			]),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.set.addValues': mainSchema;
	}
}
