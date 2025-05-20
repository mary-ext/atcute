import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneSetDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.set.querySets', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		namePrefix: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		sortBy: /*#__PURE__*/ v.literalEnum(['createdAt', 'name', 'updatedAt']),
		sortDirection: /*#__PURE__*/ v.literalEnum(['asc', 'desc']),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get sets() {
				return /*#__PURE__*/ v.array(ToolsOzoneSetDefs.setViewSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.set.querySets': mainSchema;
	}
}
