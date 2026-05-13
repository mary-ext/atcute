import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneSettingDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.setting.listOptions', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Filter for only the specified keys. Ignored if prefix is provided
		 *
		 * @maxLength 100
		 */
		keys: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()), [
				/*#__PURE__*/ v.arrayLength(0, 100),
			]),
		),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** Filter keys by prefix */
		prefix: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** @default 'instance' */
		scope: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'instance' | 'personal' | (string & {})>(),
			'instance',
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

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.setting.listOptions': mainSchema;
	}
}
