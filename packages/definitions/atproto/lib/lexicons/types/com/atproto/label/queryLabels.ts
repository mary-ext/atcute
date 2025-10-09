import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.label.queryLabels', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 250
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 250)]),
			50,
		),
		/**
		 * Optional list of label sources (DIDs) to filter on.
		 */
		sources: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
		/**
		 * List of AT URI patterns to match (boolean 'OR'). Each may be a prefix (ending with '*'; will match inclusive of the string leading to '*'), or a full URI.
		 * @minLength 1
		 */
		uriPatterns: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
			/*#__PURE__*/ v.arrayLength(1),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'com.atproto.label.queryLabels': mainSchema;
	}
}
