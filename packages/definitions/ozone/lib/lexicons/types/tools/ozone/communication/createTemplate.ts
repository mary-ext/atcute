import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneCommunicationDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.communication.createTemplate', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Content of the template, markdown supported, can contain variable placeholders. */
			contentMarkdown: /*#__PURE__*/ v.string(),
			/** DID of the user who is creating the template. */
			createdBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/** Message language. */
			lang: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.languageCodeString()),
			/** Name of the template. */
			name: /*#__PURE__*/ v.string(),
			/** Subject of the message, used in emails. */
			subject: /*#__PURE__*/ v.string(),
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

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.communication.createTemplate': mainSchema;
	}
}
