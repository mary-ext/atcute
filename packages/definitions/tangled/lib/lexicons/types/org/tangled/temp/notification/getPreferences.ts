import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.notification.getPreferences', {
	params: null,
	output: {
		type: 'lex',
		get schema() {
			return preferencesSchema;
		},
	},
});
const _preferencesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.temp.notification.getPreferences#preferences'),
	),
	emailNotifications: /*#__PURE__*/ v.boolean(),
	followed: /*#__PURE__*/ v.boolean(),
	issueClosed: /*#__PURE__*/ v.boolean(),
	issueCommented: /*#__PURE__*/ v.boolean(),
	issueCreated: /*#__PURE__*/ v.boolean(),
	pullCommented: /*#__PURE__*/ v.boolean(),
	pullCreated: /*#__PURE__*/ v.boolean(),
	pullMerged: /*#__PURE__*/ v.boolean(),
	repoStarred: /*#__PURE__*/ v.boolean(),
	userMentioned: /*#__PURE__*/ v.boolean(),
});

type main$schematype = typeof _mainSchema;
type preferences$schematype = typeof _preferencesSchema;

export interface mainSchema extends main$schematype {}
export interface preferencesSchema extends preferences$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const preferencesSchema = _preferencesSchema as preferencesSchema;

export interface Preferences extends v.InferInput<typeof preferencesSchema> {}

export interface $params {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.notification.getPreferences': mainSchema;
	}
}
