import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneInboxDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.inbox.listNotifications', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Account to preview. Only Ozone staff can read another account; this does not change its read state. */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		reasons: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.string<
					| 'actionReversed'
					| 'actionTaken'
					| 'appealResolved'
					| 'reportReopened'
					| 'reportResolved'
					| 'standingChanged'
					| (string & {})
				>(),
			),
		),
		section: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'accountStatus' | 'reports' | 'subjects' | (string & {})>(),
		),
		/** @default false */
		unreadOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get notifications() {
				return /*#__PURE__*/ v.array(ToolsOzoneInboxDefs.notificationSchema);
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
		'tools.ozone.inbox.listNotifications': mainSchema;
	}
}
