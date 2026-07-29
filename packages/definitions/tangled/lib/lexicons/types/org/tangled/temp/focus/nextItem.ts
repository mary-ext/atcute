import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.focus.nextItem', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** ID of the notification just addressed, to be marked read. */
			currentId: /*#__PURE__*/ v.integer(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** AT-URI of the issue to navigate to, if the item is an issue. */
			issueAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
			/** ID of the next notification to address. Absent when focus mode has ended. */
			notificationId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** AT-URI of the pull to navigate to, if the item is a pull. */
			pullAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
			/** DID of the repository the next item belongs to. Absent when focus mode has ended. */
			repoDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.focus.nextItem': mainSchema;
	}
}
