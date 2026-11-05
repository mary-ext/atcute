import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.account.getNewsletterPreference', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'dismissed' | 'subscribed' | (string & {})>()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.account.getNewsletterPreference': mainSchema;
	}
}
