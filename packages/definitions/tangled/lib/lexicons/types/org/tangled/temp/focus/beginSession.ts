import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.focus.beginSession', {
	params: null,
	input: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** AT-URI of the issue to navigate to, if the item is an issue. */
			issueAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
			/** ID of the first notification to address. Absent if the queue is empty. */
			notificationId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** AT-URI of the pull to navigate to, if the item is a pull. */
			pullAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
			/** DID of the repository the item belongs to. Absent if the queue is empty. */
			repoDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.focus.beginSession': mainSchema;
	}
}
