import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneInboxDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.inbox.getActionedSubject', {
	params: /*#__PURE__*/ v.object({
		/** Opaque cursor for the next page of this subject's action history. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Account to preview. Defaults to the authenticated account; another account requires an active
		 * moderator, triage, or admin credential.
		 */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Maximum number of actions to return.
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** DID or AT-URI of the subject to retrieve. */
		subject: /*#__PURE__*/ v.genericUriString(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneInboxDefs.subjectViewDetailSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.inbox.getActionedSubject': mainSchema;
	}
}
