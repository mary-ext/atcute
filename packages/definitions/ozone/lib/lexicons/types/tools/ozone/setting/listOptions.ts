import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneSettingDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('tools.ozone.setting.listOptions', {
	params: /*#__PURE__*/ v.object({
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		scope: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'instance' | 'personal' | (string & {})>(),
			'instance',
		),
		prefix: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		keys: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.nsidString()), [/*#__PURE__*/ v.arrayLength(0, 100)]),
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get options() {
				return /*#__PURE__*/ v.array(ToolsOzoneSettingDefs.optionSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.setting.listOptions': mainSchema;
	}
}
