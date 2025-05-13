import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.label.queryLabels', {
	params: /*#__PURE__*/ v.object({
		uriPatterns: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
		sources: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 250)]),
			50,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.label.queryLabels': mainSchema;
	}
}
