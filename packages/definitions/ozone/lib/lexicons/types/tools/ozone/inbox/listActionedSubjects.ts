import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneInboxDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.inbox.listActionedSubjects', {
	params: /*#__PURE__*/ v.object({
		/** An opaque cursor for pagination. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Account to preview. Defaults to the authenticated account; another account requires an active
		 * moderator, triage, or admin credential.
		 */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Filter subject activity. pending includes subjects whose latest appeal report is not closed; resolved
		 * includes subjects whose latest appeal report is closed. unread includes subjects whose public updatedAt
		 * is after the subjects section's seenAt watermark.
		 *
		 * @default 'all'
		 */
		filter: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.literalEnum(['all', 'pending', 'resolved', 'unread']),
			'all',
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
		/** @default 'desc' */
		sortDirection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['asc', 'desc']), 'desc'),
		/** @default 'updatedAt' */
		sortField: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['createdAt', 'updatedAt']), 'updatedAt'),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get subjects() {
				return /*#__PURE__*/ v.array(ToolsOzoneInboxDefs.subjectViewSchema);
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
		'tools.ozone.inbox.listActionedSubjects': mainSchema;
	}
}
