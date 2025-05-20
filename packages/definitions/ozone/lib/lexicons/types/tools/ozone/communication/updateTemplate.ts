import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneCommunicationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.communication.updateTemplate', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			contentMarkdown: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			disabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			id: /*#__PURE__*/ v.string(),
			lang: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.languageCodeString()),
			name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			updatedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneCommunicationDefs.templateViewSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.communication.updateTemplate': mainSchema;
	}
}
