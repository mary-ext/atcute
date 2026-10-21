import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneInboxDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.inbox.putNotificationPreferences', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Notify about moderation actions against the account or its content, excluding labeling. */
			account: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/** Notify about labels applied to or removed from the account or its content. */
			labels: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/** Notify about outcomes of reports filed by the account. */
			reports: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get preferences() {
				return ToolsOzoneInboxDefs.notificationPreferencesSchema;
			},
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
		'tools.ozone.inbox.putNotificationPreferences': mainSchema;
	}
}
