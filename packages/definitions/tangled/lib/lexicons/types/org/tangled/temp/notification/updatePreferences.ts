import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.notification.updatePreferences', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			emailNotifications: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			followed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			issueClosed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			issueCommented: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			issueCreated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			pullCommented: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			pullCreated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			pullMerged: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			repoStarred: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			userMentioned: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.notification.updatePreferences': mainSchema;
	}
}
