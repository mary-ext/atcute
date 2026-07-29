import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _emailSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.account.listEmails#email')),
	/** Email address. */
	address: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Whether this is the primary email address. */
	primary: /*#__PURE__*/ v.boolean(),
	/** Whether the address has been verified. */
	verified: /*#__PURE__*/ v.boolean(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.account.listEmails', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get emails() {
				return /*#__PURE__*/ v.array(emailSchema);
			},
		}),
	},
});

type email$schematype = typeof _emailSchema;
type main$schematype = typeof _mainSchema;

export interface emailSchema extends email$schematype {}
export interface mainSchema extends main$schematype {}

export const emailSchema = _emailSchema as emailSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Email extends v.InferInput<typeof emailSchema> {}

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.account.listEmails': mainSchema;
	}
}
