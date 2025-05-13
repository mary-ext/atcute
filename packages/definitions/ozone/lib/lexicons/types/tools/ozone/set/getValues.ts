import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneSetDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.set.getValues', {
	params: /*#__PURE__*/ v.object({
		name: /*#__PURE__*/ v.string(),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			100,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get set() {
				return ToolsOzoneSetDefs.setViewSchema;
			},
			values: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.set.getValues': mainSchema;
	}
}
