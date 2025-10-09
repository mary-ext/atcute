import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from '../label/defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.temp.fetchLabels', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @minimum 1
		 * @maximum 250
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 250)]),
			50,
		),
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get labels() {
				return /*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.temp.fetchLabels': mainSchema;
	}
}
